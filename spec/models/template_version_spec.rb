require "rails_helper"

RSpec.describe TemplateVersion, type: :model do
  describe "#create_integration_mappings callback" do
    context "when the template version is published and status has changed" do
      let!(:jurisdiction) { create(:sub_district) }
      let!(:disabled_api_jurisdiction) { create(:sub_district) }
      let!(:template_version) { create(:template_version, status: "scheduled") }
      let!(:existing_mapping) do
        create(:integration_mapping, template_version: template_version)
      end

      it "creates integration requirements mappings for jurisdictions without mapping and whose api keys are enabled" do
        expect { jurisdiction.update(external_api_state: "j_on") }.to change {
          IntegrationMapping.count
        }.by(1)

        expect(
          IntegrationMapping.find_by(
            template_version: template_version,
            jurisdiction: jurisdiction
          )
        ).to be_present

        expect(
          IntegrationMapping.find_by_jurisdiction_id(
            disabled_api_jurisdiction.id
          )
        ).not_to be_present
      end
    end

    context "when the template version status has not changed" do
      let(:template_version) { create(:template_version, status: :published) }

      before { template_version.save! }

      it "does not create integration requirements mappings" do
        expect { template_version.touch }.not_to change {
          IntegrationMapping.count
        }
      end
    end
  end
end
