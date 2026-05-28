require "rails_helper"

RSpec.describe SubmissionContact, type: :model do
  describe "validations" do
    let(:jurisdiction) { create(:sub_district) }

    it "allows the same email for different contact classes" do
      create(
        :application_submission_contact,
        jurisdiction: jurisdiction,
        email: "contact@example.com"
      )

      contact =
        build(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          email: "contact@example.com"
        )

      expect(contact).to be_valid
    end

    it "does not allow duplicate emails for the same contact class" do
      create(
        :meeting_submission_contact,
        jurisdiction: jurisdiction,
        email: "meetings@example.com"
      )

      contact =
        build(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          email: "meetings@example.com"
        )

      expect(contact).not_to be_valid
    end

    it "does not apply default contact uniqueness to project meeting contacts" do
      create(
        :meeting_submission_contact,
        jurisdiction: jurisdiction,
        default: true
      )

      contact =
        build(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          default: true
        )

      expect(contact).to be_valid
    end

    it "does not allow multiple default application submission contacts" do
      contact =
        build(
          :application_submission_contact,
          jurisdiction: jurisdiction,
          default: true
        )

      expect(contact).not_to be_valid
    end
  end

  describe "callbacks" do
    it "enqueues confirmation email after creating an unconfirmed contact" do
      jurisdiction = create(:sub_district)

      expect {
        create(
          :meeting_submission_contact,
          jurisdiction: jurisdiction,
          confirmed_at: nil,
          confirmation_sent_at: nil
        )
      }.to have_enqueued_mail(PermitHubMailer, :submission_contact_confirm)
    end
  end
end
