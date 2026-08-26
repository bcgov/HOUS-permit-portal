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
          :property_information_submission_contact,
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

    it "uses a distinct property information contact class" do
      contact = build(:property_information_submission_contact)

      expect(contact).to be_a(PropertyInformationSubmissionContact)
      expect(contact.confirmation_subject_key).to eq(
        "property_information_contact_confirm"
      )
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

    it "prevents deleting the last confirmed application submission contact while inbox is enabled" do
      jurisdiction = create(:sub_district)
      contact = jurisdiction.application_submission_contacts.first

      expect { contact.destroy! }.to raise_error(
        ActiveRecord::RecordNotDestroyed
      )
      expect(contact.errors[:base]).to include(
        I18n.t(
          "activerecord.errors.models.submission_contact.last_confirmed_contact",
          feature: "submission inbox"
        )
      )
      expect(ApplicationSubmissionContact.exists?(contact.id)).to be(true)
    end

    it "prevents deleting the last confirmed project meeting contact while project meetings are enabled" do
      jurisdiction = create(:sub_district, project_meetings_enabled: true)
      contact = create(:meeting_submission_contact, jurisdiction: jurisdiction)

      expect { contact.destroy! }.to raise_error(
        ActiveRecord::RecordNotDestroyed
      )
      expect(contact.errors[:base]).to include(
        I18n.t(
          "activerecord.errors.models.submission_contact.last_confirmed_contact",
          feature: "project meetings"
        )
      )
      expect(MeetingSubmissionContact.exists?(contact.id)).to be(true)
    end

    it "prevents deleting the last confirmed property information contact while property information requests are enabled" do
      jurisdiction =
        create(
          :sub_district,
          project_meetings_enabled: true,
          property_information_requests_enabled: true
        )
      contact =
        create(
          :property_information_submission_contact,
          jurisdiction: jurisdiction
        )

      expect { contact.destroy! }.to raise_error(
        ActiveRecord::RecordNotDestroyed
      )
      expect(contact.errors[:base]).to include(
        I18n.t(
          "activerecord.errors.models.submission_contact.last_confirmed_contact",
          feature: "property information requests"
        )
      )
      expect(PropertyInformationSubmissionContact.exists?(contact.id)).to be(
        true
      )
    end

    it "allows deleting an application submission contact when another confirmed contact remains" do
      jurisdiction = create(:sub_district)
      contact = jurisdiction.application_submission_contacts.first
      create(:application_submission_contact, jurisdiction: jurisdiction)

      expect { contact.destroy! }.to change(
        ApplicationSubmissionContact,
        :count
      ).by(-1)
    end

    it "allows deleting the last confirmed application submission contact when inbox is disabled" do
      jurisdiction = create(:sub_district)
      contact = jurisdiction.application_submission_contacts.first
      jurisdiction.update!(inbox_enabled: false)

      expect { contact.destroy! }.to change(
        ApplicationSubmissionContact,
        :count
      ).by(-1)
    end

    it "allows deleting the last confirmed project meeting contact when project meetings are disabled" do
      jurisdiction = create(:sub_district, project_meetings_enabled: false)
      contact = create(:meeting_submission_contact, jurisdiction: jurisdiction)

      expect { contact.destroy! }.to change(
        MeetingSubmissionContact,
        :count
      ).by(-1)
    end
  end
end
