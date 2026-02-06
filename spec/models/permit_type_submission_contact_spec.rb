require "rails_helper"

RSpec.describe PermitTypeSubmissionContact, type: :model do
  describe "associations" do
    it { should belong_to(:jurisdiction) }
    it { should belong_to(:permit_type) }
  end

  describe "validations" do
    it "is invalid with an incorrect email format" do
      contact =
        build(
          :permit_type_submission_contact,
          jurisdiction: create(:sub_district),
          email: "not-an-email"
        )

      expect(contact).not_to be_valid
      expect(contact.errors[:email]).to be_present
    end
  end

  describe "confirmation" do
    let!(:jurisdiction) { create(:sub_district) }
    let!(:permit_type) { create(:permit_type) }

    before do
      allow(PermitHubMailer).to receive(
        :permit_type_submission_contact_confirm
      ).and_return(double(deliver_later: true))
      allow(jurisdiction).to receive(:reindex)
    end

    it "generates confirmation attributes on create" do
      contact =
        described_class.create!(
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          email: "test@example.com",
          confirmed_at: nil,
          confirmation_token: nil
        )

      expect(contact.confirmation_token).to be_present
      expect(contact.confirmation_sent_at).to be_present
    end

    it "resets confirmation when email changes" do
      contact =
        described_class.create!(
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          email: "old@example.com",
          confirmed_at: Time.current
        )

      contact.update!(email: "new@example.com")

      expect(contact.confirmed_at).to be_nil
    end

    it "confirms by token" do
      contact =
        described_class.create!(
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          email: "confirm@example.com",
          confirmed_at: nil
        )

      described_class.confirm_by_token!(contact.confirmation_token)

      expect(contact.reload).to be_confirmed
    end
  end
end
