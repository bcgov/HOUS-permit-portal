require "rails_helper"

RSpec.describe Sandbox, type: :model do
  describe "unique template_version_status_scope validation" do
    let!(:jurisdiction) { create(:sub_district) }
    let!(:other_jurisdiction) { create(:sub_district) }

    it "does not allow duplicate scopes within the same jurisdiction" do
      duplicate_sandbox =
        build(
          :sandbox,
          template_version_status_scope: :published,
          jurisdiction: jurisdiction
        )

      expect(duplicate_sandbox).not_to be_valid
      expect(
        duplicate_sandbox.errors[:template_version_status_scope]
      ).to include("has already been taken")
    end

    it "allows the same scope in different jurisdictions" do
      expect(jurisdiction.sandboxes.published.count).to eq(1)
      expect(other_jurisdiction.sandboxes.published.count).to eq(1)
    end
  end

  describe "#name" do
    it "returns the translated name for published scope" do
      sandbox = build(:sandbox, template_version_status_scope: :published)
      expect(sandbox.name).to eq(
        I18n.t("activerecord.attributes.sandbox.scope_names.published")
      )
    end

    it "returns the translated name for scheduled scope" do
      sandbox = build(:sandbox, :scheduled)
      expect(sandbox.name).to eq(
        I18n.t("activerecord.attributes.sandbox.scope_names.scheduled")
      )
    end
  end
end
