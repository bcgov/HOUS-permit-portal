require "rails_helper"

RSpec.describe Jurisdiction, type: :model do
  describe "associations" do
    # Testing direct associations
    it { should have_many(:permit_applications) }
    it { should have_many(:users).class_name("User") }

    # Testing has_many :through association
    it { should have_many(:submitters).through(:permit_applications).source(:submitter) }
  end

  describe "#create_integration_requirements_mappings after_save callback on new jurisdiction" do
    let!(:template_version_published) { create(:template_version, status: "published") }
    let!(:template_version_deprecated) do
      create(:template_version, status: "deprecated", deprecation_reason: "new_publish")
    end
    let!(:template_version_deprecated_other) do
      create(:template_version, status: "deprecated", deprecation_reason: "unscheduled", deprecated_by: create(:user))
    end

    context "when external_api_enabled is true" do
      let(:jurisdiction) { create(:sub_district, external_api_enabled: true) }
      it "creates mappings for published template versions" do
        expect(jurisdiction.jurisdiction_integration_requirements_mappings.count).to eq(2)
        expect(jurisdiction.jurisdiction_integration_requirements_mappings.pluck(:template_version_id)).to match_array(
          [template_version_published.id, template_version_deprecated.id],
        )
      end
    end

    context "when external_api_enabled is false" do
      let(:jurisdiction) { create(:sub_district) }

      it "does not create any mappings" do
        expect(jurisdiction.jurisdiction_integration_requirements_mappings.count).to eq(0)
      end
    end
  end

  describe "#create_integration_requirements_mappings after_save callback on existing jurisdiction" do
    context "when external_api_enabled is changed to true" do
      let!(:jurisdiction) { create(:sub_district) }
      let!(:template_version_published) { create(:template_version, status: "published") }
      let!(:template_version_deprecated) do
        create(:template_version, status: "deprecated", deprecation_reason: "new_publish")
      end
      let!(:template_version_deprecated_other) do
        create(:template_version, status: "deprecated", deprecation_reason: "unscheduled", deprecated_by: create(:user))
      end

      it "creates mappings for published template versions" do
        expect(jurisdiction.jurisdiction_integration_requirements_mappings.count).to eq(0)

        jurisdiction.update(external_api_enabled: true)

        expect(jurisdiction.jurisdiction_integration_requirements_mappings.count).to eq(2)
        expect(jurisdiction.jurisdiction_integration_requirements_mappings.pluck(:template_version_id)).to match_array(
          [template_version_published.id, template_version_deprecated.id],
        )
      end
    end
  end
end
