require "rails_helper"

RSpec.describe TemplateVersion, type: :model, search: true do
  describe "#requires_project_meeting_for_jurisdiction?" do
    let(:jurisdiction) { create(:sub_district) }
    let(:other_jurisdiction) { create(:sub_district) }
    let(:template_version) { create(:template_version) }

    it "returns true when the jurisdiction customization requires a project meeting" do
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: jurisdiction,
        template_version: template_version,
        requires_project_meeting: true
      )

      expect(
        template_version.requires_project_meeting_for_jurisdiction?(
          jurisdiction.id
        )
      ).to be(true)
      expect(
        template_version.requires_project_meeting_for_jurisdiction?(
          other_jurisdiction.id
        )
      ).to be(false)
    end

    it "uses the provided sandbox scope" do
      sandbox = jurisdiction.sandboxes.published.first
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: jurisdiction,
        template_version: template_version,
        sandbox: sandbox,
        requires_project_meeting: true
      )

      expect(
        template_version.requires_project_meeting_for_jurisdiction?(
          jurisdiction.id
        )
      ).to be(false)
      expect(
        template_version.requires_project_meeting_for_jurisdiction?(
          jurisdiction.id,
          sandbox
        )
      ).to be(true)
    end
  end

  describe "#disabled_for_jurisdiction?" do
    let(:jurisdiction) { create(:sub_district) }
    let(:template_version) { create(:template_version) }

    it "returns true when the jurisdiction customization disables the template" do
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: jurisdiction,
        template_version: template_version,
        disabled: true
      )

      expect(
        template_version.disabled_for_jurisdiction?(jurisdiction.id)
      ).to be(true)
    end
  end

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
