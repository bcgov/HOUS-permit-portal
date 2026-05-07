require "rails_helper"

RSpec.describe TemplateVersionPreview::ManagementService,
               type: :service,
               search: true do
  let(:template_version) { create(:template_version, status: :draft) }
  let(:service) { described_class.new(template_version) }

  before do
    # Use the test ActiveJob adapter so deliver_later doesn't actually enqueue.
    ActiveJob::Base.queue_adapter = :test

    allow(PermitHubMailer).to receive(
      :notify_new_or_unconfirmed_template_version_preview
    ).and_return(double(deliver_later: true))
    allow(PermitHubMailer).to receive(
      :notify_template_version_preview
    ).and_return(double(deliver_later: true))
  end

  describe "#invite_previewers!" do
    subject(:result) { service.invite_previewers!(emails) }

    let(:emails) { [] }

    context "when inviting valid existing users" do
      let!(:user1) { create(:user, email: "user1@example.com") }
      let!(:user2) { create(:user, email: "user2@example.com") }
      let(:emails) { %w[user1@example.com user2@example.com] }

      it "creates template version previews for existing users" do
        expect { result }.to change(TemplateVersionPreview, :count).by(2)

        expect(result[:previews].map(&:previewer_id)).to contain_exactly(
          user1.id,
          user2.id
        )
        expect(result[:failed_emails]).to be_empty
      end

      it "sends notification emails to confirmed and active users" do
        previews = result[:previews]

        expect(PermitHubMailer).to have_received(
          :notify_template_version_preview
        ).twice
        previews.each do |preview|
          expect(PermitHubMailer).to have_received(
            :notify_template_version_preview
          ).with(template_version_preview: preview).once
        end
      end
    end

    context "when inviting new users" do
      let(:emails) { ["new_user@example.com"] }

      it "creates new users and template version previews" do
        expect { result }.to change(User, :count).by(1).and change(
                TemplateVersionPreview,
                :count
              ).by(1)

        new_user = User.find_by(email: "new_user@example.com")
        expect(new_user).to be_present
        expect(new_user.first_name).to eq("New_user")
        expect(new_user.last_name).to eq("User")
        expect(new_user.role).to eq("submitter")

        expect(result[:previews].first.previewer).to eq(new_user)
        expect(result[:failed_emails]).to be_empty
      end

      it "sends notification emails to newly created users" do
        preview = result[:previews].first
        expect(PermitHubMailer).to have_received(
          :notify_new_or_unconfirmed_template_version_preview
        ).with(template_version_preview: preview, user: preview.previewer).once
      end
    end

    context "when inviting with invalid emails" do
      let(:emails) { %w[invalid_email another_invalid] }

      it "does not create template version previews and returns failed emails" do
        expect { result }.to change(TemplateVersionPreview, :count).by(
          0
        ).and change(User, :count).by(0)

        expect(result[:previews]).to be_empty

        expect(result[:failed_emails]).to match(
          [
            { email: "invalid_email", error: "Invalid email format" },
            { email: "another_invalid", error: "Invalid email format" }
          ]
        )
      end

      it "does not send any emails" do
        result
        expect(PermitHubMailer).not_to have_received(
          :notify_new_or_unconfirmed_template_version_preview
        )
        expect(PermitHubMailer).not_to have_received(
          :notify_template_version_preview
        )
      end
    end

    context "when inviting a mix of valid and invalid emails" do
      let!(:user) { create(:user, email: "user@example.com") }
      let(:emails) { %w[user@example.com invalid_email] }

      it "creates template version previews for valid emails and reports failures" do
        expect { result }.to change(TemplateVersionPreview, :count).by(
          1
        ).and change(User, :count).by(0)

        expect(result[:previews].first.previewer).to eq(user)
        expect(result[:failed_emails]).to match(
          [{ email: "invalid_email", error: "Invalid email format" }]
        )
      end

      it "sends notification emails only for valid previews" do
        result
        expect(PermitHubMailer).to have_received(
          :notify_template_version_preview
        ).once
        expect(PermitHubMailer).not_to have_received(
          :notify_new_or_unconfirmed_template_version_preview
        )
      end
    end

    context "when re-inviting a previewer that already has a preview" do
      let!(:user) { create(:user, email: "user@example.com") }
      let(:emails) { %w[user@example.com user@example.com] }

      it "does not create a duplicate preview and returns the existing one twice" do
        # First invite creates the preview; second iteration should find the existing one.
        expect { result }.to change(TemplateVersionPreview, :count).by(1)

        expect(result[:failed_emails]).to be_empty
        expect(result[:previews].map(&:id).uniq.length).to eq(1)
      end

      it "re-sends the notification email on every invite" do
        result

        expect(PermitHubMailer).to have_received(
          :notify_template_version_preview
        ).twice
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
        expect { result }.to change(User, :count).by(0).and change(
                TemplateVersionPreview,
                :count
              ).by(0)

        expect(result[:previews]).to be_empty
        expect(result[:failed_emails]).to match(
          [
            {
              email: "fail_user@example.com",
              error: "First name can't be blank"
            }
          ]
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

      it "sends notify_new_or_unconfirmed_template_version_preview emails" do
        result

        previews =
          TemplateVersionPreview.where(
            previewer: [unconfirmed_user, discarded_user]
          )
        previews.each do |preview|
          expect(PermitHubMailer).to have_received(
            :notify_new_or_unconfirmed_template_version_preview
          ).with(
            template_version_preview: preview,
            user: preview.previewer
          ).once
        end
      end
    end

    context "when the user is confirmed and active" do
      let!(:confirmed_user) { create(:user, email: "confirmed@example.com") }
      let(:emails) { ["confirmed@example.com"] }

      it "sends notify_template_version_preview email" do
        result

        preview = TemplateVersionPreview.last
        expect(PermitHubMailer).to have_received(
          :notify_template_version_preview
        ).with(template_version_preview: preview).once
      end
    end
  end
end
