require "rails_helper"

RSpec.describe UserLicenseAgreement, type: :model do
  describe "associations" do
    it { should belong_to(:user).optional }
    it { should belong_to(:agreement).class_name("EndUserLicenseAgreement") }
  end

  describe "validations" do
    it { should validate_presence_of(:accepted_at) }

    it "requires the agreement variant to match the user's eula_variant" do
      user = create(:user, :submitter) # submitter => eula_variant "open"
      agreement =
        EndUserLicenseAgreement.create!(variant: :employee, active: true)

      record =
        described_class.new(
          user: user,
          agreement: agreement,
          accepted_at: Time.current
        )

      expect(record).not_to be_valid
      expect(record.errors[:agreement]).to include(
        "variant must match user's eula_variant"
      )
    end
  end

  describe ".active_agreement" do
    it "returns records for the current active agreement for the given variant" do
      user = create(:user, :submitter)

      active = EndUserLicenseAgreement.create!(variant: :open, active: true)
      inactive = EndUserLicenseAgreement.create!(variant: :open, active: false)

      active_record =
        described_class.create!(
          user: user,
          agreement: active,
          accepted_at: Time.current
        )
      described_class.create!(
        user: user,
        agreement: inactive,
        accepted_at: Time.current
      )

      expect(described_class.active_agreement(:open)).to match_array(
        [active_record]
      )
    end
  end
end
