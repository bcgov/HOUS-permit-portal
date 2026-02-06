require "rails_helper"

RSpec.describe EndUserLicenseAgreement, type: :model do
  describe "associations" do
    it do
      should have_many(:user_license_agreements).with_foreign_key(:agreement_id)
    end
  end

  describe "enums" do
    it "defines variants" do
      expect(described_class.variants.keys).to include("open", "employee")
    end
  end

  describe ".active_agreement" do
    it "returns the active agreement for the given variant" do
      active = described_class.create!(variant: :open, active: true)
      described_class.create!(variant: :open, active: false)

      expect(described_class.active_agreement(:open)).to eq(active)
    end
  end

  describe "active replacement" do
    it "deactivates other active agreements for the same variant on create" do
      older = described_class.create!(variant: :open, active: true)
      newer = described_class.create!(variant: :open, active: true)

      expect(newer).to be_persisted
      expect(older.reload.active).to eq(false)
      expect(newer.reload.active).to eq(true)
    end

    it "does not deactivate active agreements for other variants" do
      employee = described_class.create!(variant: :employee, active: true)
      described_class.create!(variant: :open, active: true)

      expect(employee.reload.active).to eq(true)
    end
  end

  describe "sanitization" do
    it "sanitizes content" do
      eula =
        described_class.create!(
          variant: :open,
          active: false,
          content: "<script>alert('xss')</script><p>ok</p>"
        )

      expect(eula.reload.content).to include("ok")
      expect(eula.content).not_to include("<script>")
    end
  end
end
