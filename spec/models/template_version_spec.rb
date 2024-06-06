require "rails_helper"

RSpec.describe TemplateVersion, type: :model do
  describe "#create_integration_requirements_mappings callback" do
    context "when the template version is published and status has changed" do
      let!(:jurisdiction) { create(:sub_district, external_api_enabled: true) }
      let!(:disabled_api_jurisdiction) { create(:sub_district, external_api_enabled: false) }
      let!(:template_version) { create(:template_version, status: "scheduled") }
      let!(:existing_mapping) do
        create(:jurisdiction_integration_requirements_mapping, template_version: template_version)
      end

      it "creates integration requirements mappings for jurisdictions without mapping and whose api keys are enabled" do
        expect { template_version.update(status: "published") }.to change {
          JurisdictionIntegrationRequirementsMapping.count
        }.by(1)

        expect(
          JurisdictionIntegrationRequirementsMapping.find_by(
            template_version: template_version,
            jurisdiction: jurisdiction,
          ),
        ).to be_present

        expect(
          JurisdictionIntegrationRequirementsMapping.find_by_jurisdiction_id(disabled_api_jurisdiction.id),
        ).not_to be_present
      end
    end

    context "when the template version is not published" do
      let!(:jurisdiction) { create(:sub_district, external_api_enabled: true) }
      let!(:existing_mapping) do
        create(:jurisdiction_integration_requirements_mapping, template_version: template_version)
      end
      let!(:template_version) { build(:template_version, status: "scheduled") }

      it "does not create integration requirements mappings" do
        expect { template_version.save }.not_to change { JurisdictionIntegrationRequirementsMapping.count }
      end
    end

    context "when the template version status has not changed" do
      let(:template_version) { create(:template_version, status: :published) }

      before { template_version.save! }

      it "does not create integration requirements mappings" do
        expect { template_version.touch }.not_to change { JurisdictionIntegrationRequirementsMapping.count }
      end
    end
  end
end
