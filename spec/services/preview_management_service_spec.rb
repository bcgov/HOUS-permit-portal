require "rails_helper"

RSpec.describe EarlyAccess::PreviewManagementService, type: :service do
  let(:early_access_requirement_template) do
    create(:early_access_requirement_template)
  end
  let(:service) { described_class.new(early_access_requirement_template) }

  before do
    # Assuming you are using ActiveJob for `deliver_later`
    ActiveJob::Base.queue_adapter = :test

    # Mock the mailers
    allow(PermitHubMailer).to receive(
      :notify_new_or_unconfirmed_preview
    ).and_return(double(deliver_later: true))
    allow(PermitHubMailer).to receive(:notify_preview).and_return(
      double(deliver_later: true)
    )
  end

  describe "#invite_previewers!" do
    subject { service.invite_previewers!(emails) }

    let(:emails) { [] }

    context "when inviting valid existing users" do
      let!(:user1) { create(:user, email: "user1@example.com") }
      let!(:user2) { create(:user, email: "user2@example.com") }
      let(:emails) { %w[user1@example.com user2@example.com] }

      it "creates early access previews for existing users" do
        expect { subject }.to change(EarlyAccessPreview, :count).by(2)

        expect(subject[:previews].map(&:previewer_id)).to contain_exactly(
          user1.id,
          user2.id
        )
        expect(subject[:failed_emails]).to be_empty
      end

      it "sends notification emails to confirmed and active users" do
        subject
        previews = subject[:previews]

        expect(PermitHubMailer).to have_received(:notify_preview).twice
        previews.each do |preview|
          expect(PermitHubMailer).to have_received(:notify_preview).with(
            early_access_preview: preview
          ).once
        end
      end
    end

    context "when inviting new users" do
      let(:emails) { ["new_user@example.com"] }

      it "creates new users and early access previews" do
        expect { subject }.to change(User, :count).by(1).and change(
                EarlyAccessPreview,
                :count
              ).by(1)

        new_user = User.find_by(email: "new_user@example.com")
        expect(new_user).to be_present
        expect(new_user.first_name).to eq("New_user")
        expect(new_user.last_name).to eq("<last name>")
        expect(new_user.role).to eq("submitter")

        expect(subject[:previews].first.previewer).to eq(new_user)
        expect(subject[:failed_emails]).to be_empty
      end

      it "sends notification emails to newly created users" do
        subject
        preview = subject[:previews].first
        expect(PermitHubMailer).to have_received(
          :notify_new_or_unconfirmed_preview
        ).with(early_access_preview: preview, user: preview.previewer).once
      end
    end

    context "when inviting with invalid emails" do
      let(:emails) { %w[invalid_email another_invalid] }

      it "does not create early access previews and returns failed emails" do
        # Separate the expectations for better clarity and to avoid chaining unsupported methods
        expect { subject }.not_to change(EarlyAccessPreview, :count)
        expect { subject }.not_to change(User, :count)

        # Verify that no previews were created
        expect(subject[:previews]).to be_empty

        # Verify that the failed emails array contains the expected errors
        expect(subject[:failed_emails]).to match(
          [
            { email: "invalid_email", error: "Invalid email format" },
            { email: "another_invalid", error: "Invalid email format" }
          ]
        )
      end

      it "does not send any emails" do
        subject
        expect(PermitHubMailer).not_to have_received(
          :notify_new_or_unconfirmed_preview
        )
        expect(PermitHubMailer).not_to have_received(:notify_preview)
      end
    end

    context "when inviting a mix of valid and invalid emails" do
      let!(:user) { create(:user, email: "user@example.com") }
      let(:emails) { %w[user@example.com invalid_email] }

      it "creates early access previews for valid emails and reports failures" do
        expect { subject }.to change(EarlyAccessPreview, :count).by(1)
        expect { subject }.not_to change(User, :count)

        expect(subject[:previews].first.previewer).to eq(user)
        expect(subject[:failed_emails]).to match(
          [{ email: "invalid_email", error: "Invalid email format" }]
        )
      end

      it "sends notification emails only for valid previews" do
        subject
        expect(PermitHubMailer).to have_received(:notify_preview).once
        expect(PermitHubMailer).not_to have_received(
          :notify_new_or_unconfirmed_preview
        )
      end
    end

    context "when inviting duplicate emails" do
      let!(:user) { create(:user, email: "user@example.com") }
      let(:emails) { %w[user@example.com user@example.com] }

      before do
        # Simulate uniqueness constraint on early_access_previews
        allow_any_instance_of(EarlyAccessRequirementTemplate).to receive(
          :early_access_previews
        ).and_return(double("Association", build: build(:early_access_preview)))
      end

      it "handles ActiveRecord::RecordNotUnique errors" do
        allow_any_instance_of(EarlyAccessRequirementTemplate).to receive(
          :early_access_previews
        ).and_raise(ActiveRecord::RecordNotUnique)

        result = subject

        expect(result[:previews]).to be_empty
        expect(result[:failed_emails]).to match(
          [
            {
              email: "user@example.com",
              error: "User already invited to preview"
            },
            {
              email: "user@example.com",
              error: "User already invited to preview"
            }
          ]
        )
      end
    end

    context "when creating a new user fails" do
      let(:emails) { ["fail_user@example.com"] }

      before do
        allow(User).to receive(:build).and_return(
          double(
            save: false,
            errors: double(full_messages: ['First name can\'t be blank'])
          )
        )
      end

      it "reports the user creation failure" do
        expect { subject }.not_to change(User, :count)
        expect { subject }.not_to change(EarlyAccessPreview, :count)

        expect(subject[:previews]).to be_empty
        expect(subject[:failed_emails]).to match(
          [
            {
              email: "fail_user@example.com",
              error: "First name can't be blank"
            }
          ]
        )
      end
    end

    context "when saving an early access preview fails" do
      let(:emails) { ["user@example.com"] }

      before do
        allow_any_instance_of(EarlyAccessRequirementTemplate).to receive(
          :early_access_previews
        ).and_return(
          double(
            build:
              double(
                save: false,
                errors: double(full_messages: ["Preview cannot be blank"])
              )
          )
        )
      end

      it "reports the preview saving failure" do
        expect { subject }.not_to change(EarlyAccessPreview, :count)

        expect(subject[:previews]).to be_empty
        expect(subject[:failed_emails]).to match(
          [{ email: "user@example.com", error: "Preview cannot be blank" }]
        )
      end
    end

    context "when the user is unconfirmed or discarded" do
      let!(:unconfirmed_user) do
        create(:user, email: "unconfirmed@example.com", confirmed: false)
      end
      let!(:discarded_user) do
        create(:user, email: "discarded@example.com", discarded_at: Time.now)
      end
      let(:emails) { %w[unconfirmed@example.com discarded@example.com] }

      it "sends notify_new_or_unconfirmed_preview emails" do
        subject

        previews =
          EarlyAccessPreview.where(
            previewer: [unconfirmed_user, discarded_user]
          )
        previews.each do |preview|
          expect(PermitHubMailer).to have_received(
            :notify_new_or_unconfirmed_preview
          ).with(early_access_preview: preview, user: preview.previewer).once
        end
      end
    end

    context "when the user is confirmed and active" do
      let!(:confirmed_user) { create(:user, email: "confirmed@example.com") }
      let(:emails) { ["confirmed@example.com"] }

      it "sends notify_preview email" do
        subject

        preview = EarlyAccessPreview.last
        expect(PermitHubMailer).to have_received(:notify_preview).with(
          early_access_preview: preview
        ).once
      end
    end
  end
end
