require "rails_helper"

RSpec.describe PermitClassification, type: :model do
  describe "validations" do
    subject { build(:permit_classification) }

    it { should validate_presence_of(:code) }
    it { should validate_uniqueness_of(:code) }
    it { should validate_presence_of(:name) }

    it "prevents changing code once persisted" do
      pc =
        create(
          :permit_classification,
          code: "abc",
          type: "PermitClassification"
        )
      pc.code = "def"
      expect(pc).not_to be_valid
      expect(pc.errors[:code]).to include("cannot be changed once set")
    end

    it "prevents changing type once persisted" do
      pc = create(:permit_classification, type: "PermitClassification")
      pc.type = "SomeOtherType"
      expect(pc).not_to be_valid
      expect(pc.errors[:type]).to include("cannot be changed once set")
    end
  end

  describe "scopes" do
    describe ".enabled" do
      it "returns only enabled permit classifications" do
        enabled_pc = create(:permit_classification, enabled: true)
        disabled_pc = create(:permit_classification, enabled: false)

        expect(described_class.enabled).to include(enabled_pc)
        expect(described_class.enabled).not_to include(disabled_pc)
      end
    end
  end

  describe "callbacks" do
    it "normalizes category by stripping and underscoring" do
      pc =
        create(
          :permit_classification,
          category: " Planning Zoning  ",
          type: "PermitClassification"
        )
      expect(pc.category).to eq("planning_zoning")
    end

    it "sanitizes *_html attributes on save" do
      pc =
        create(
          :permit_classification,
          description_html: "<script>alert('x')</script><p>ok</p>",
          type: "PermitClassification"
        )

      # sanitize should remove script content
      expect(pc.description_html).to include("<p>ok</p>")
      expect(pc.description_html).not_to include("<script")
    end
  end

  describe "instance methods" do
    describe "#image_url" do
      it "returns the correct image URL" do
        pc =
          create(
            :permit_classification,
            code: "low_residential",
            type: "PermitClassification"
          )
        expected_url =
          ActionController::Base.helpers.asset_path(
            "images/permit_classifications/#{pc.code}.png"
          )
        expect(pc.image_url).to eq(expected_url)
      end
    end

    describe "#category_label" do
      it "humanizes the category" do
        pc =
          build(
            :permit_classification,
            category: "planning_zoning",
            type: "PermitClassification"
          )
        expect(pc.category_label).to eq("Planning zoning")
      end

      it "returns nil when category is nil" do
        pc =
          build(
            :permit_classification,
            category: nil,
            type: "PermitClassification"
          )
        expect(pc.category_label).to be_nil
      end
    end
  end
end
