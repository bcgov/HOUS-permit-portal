require "rails_helper"

RSpec.describe JurisdictionIntegrationRequirementsMapping, type: :model do
  let(:jurisdiction) { create(:sub_district) }
  let(:mapping) { create(:jurisdiction_integration_requirements_mapping, jurisdiction: jurisdiction) }
  let(:mock_mapping) do
    {
      "sku" => {
        "id" => "1",
        "requirements" => {
          "code" => {
            "id" => "1",
            "local_system_mapping" => "test_field",
          },
        },
      },
    }
  end

  describe "#copyable_record_with_existing_mapping" do
    context "when there are no existing mappings" do
      it "returns nil" do
        expect(mapping.copyable_record_with_existing_mapping("sku", "code")).to be_nil
      end
    end

    context "when there are existing mappings but none are published" do
      let!(:existing_mapping) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: mock_mapping,
          template_version:
            create(:template_version, status: "deprecated", deprecation_reason: "new_publish", version_date: Time.now),
        )
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: mock_mapping,
          template_version:
            create(
              :template_version,
              status: "deprecated",
              deprecation_reason: "new_publish",
              version_date: Time.now + 1.day,
            ),
        )
      end
      let!(:same_mapping_different_jurisdiction) do
        create(:jurisdiction_integration_requirements_mapping, requirements_mapping: mock_mapping)
      end

      it "returns the latest version existing mapping for the jurisdiction" do
        expect(mapping.copyable_record_with_existing_mapping("sku", "code")).to eq(existing_mapping)
      end
    end

    context "when there are existing mappings and some are published" do
      let!(:published_mapping) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: mock_mapping,
        )
      end
      let!(:existing_mapping) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: mock_mapping,
          template_version: create(:template_version, status: "deprecated", deprecation_reason: "new_publish"),
        )
      end

      it "returns the first published mapping" do
        expect(mapping.copyable_record_with_existing_mapping("sku", "code")).to eq(published_mapping)
      end
    end
  end

  describe "#initialize_requirements_mapping" do
    context "when requirements_mapping is not empty" do
      it "does not change requirements_mapping" do
        mapping = create(:jurisdiction_integration_requirements_mapping, requirements_mapping: mock_mapping)
        expect(mapping.requirements_mapping).to eq(mock_mapping)
      end
    end

    context "when requirements_mapping is empty and there is no existing mappings for the jurisdiction" do
      it "initializes requirements_mapping from template requirements_block_json" do
        template_version =
          create(
            :template_version,
            requirement_blocks_json: {
              "1" => {
                "id" => "1",
                "sku" => "sku",
                "requirements" => [
                  { "id" => "1", "requirement_code" => "code" },
                  { "id" => "2", "requirement_code" => "code2" },
                ],
              },
              "2" => {
                "id" => "2",
                "sku" => "sku2",
                "requirements" => [
                  { "id" => "3", "requirement_code" => "code3" },
                  { "id" => "4", "requirement_code" => "code4" },
                ],
              },
            },
          )
        expected_mapping = {
          "sku" => {
            "id" => "1",
            "requirements" => {
              "code" => {
                "id" => "1",
                "local_system_mapping" => "",
              },
              "code2" => {
                "id" => "2",
                "local_system_mapping" => "",
              },
            },
          },
          "sku2" => {
            "id" => "2",
            "requirements" => {
              "code3" => {
                "id" => "3",
                "local_system_mapping" => "",
              },
              "code4" => {
                "id" => "4",
                "local_system_mapping" => "",
              },
            },
          },
        }
        mapping = create(:jurisdiction_integration_requirements_mapping, template_version: template_version)

        expect(mapping.requirements_mapping).to eq(expected_mapping)
      end
    end

    context "when requirements_mapping is empty and there is existing mappings to copy over for the jurisdiction" do
      let!(:template_version) do
        create(
          :template_version,
          requirement_blocks_json: {
            "1" => {
              "id" => "1",
              "sku" => "sku",
              "requirements" => [
                { "id" => "1", "requirement_code" => "code" },
                { "id" => "2", "requirement_code" => "code2" },
              ],
            },
            "2" => {
              "id" => "2",
              "sku" => "sku2",
              "requirements" => [
                { "id" => "3", "requirement_code" => "code3" },
                { "id" => "4", "requirement_code" => "code4" },
              ],
            },
          },
        )
      end

      # in test there is only one requirement template created, because of unique permit classification
      # so we manually create a new one for this tests purposes
      let!(:different_req_template) do
        create(
          :requirement_template,
          activity: create(:activity, code: :addition_alteration_renovation),
          permit_type: create(:permit_type, code: :demolition),
        )
      end

      # mapping of a deprecated template version
      let!(:existing_mapping_deprecated_ver) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: {
            "sku" => {
              "id" => "1",
              "requirements" => {
                "code" => {
                  "id" => "1",
                  "local_system_mapping" => "should_be_copied_deprecated",
                },
                "code2" => {
                  "id" => "2",
                  "local_system_mapping" => "shouldnt_be_copied",
                },
              },
            },
            "sku2" => {
              "id" => "2",
              "requirements" => {
                "code3" => {
                  "id" => "3",
                  "local_system_mapping" => "shouldnt_be_copied",
                },
                "code4" => {
                  "id" => "4",
                  "local_system_mapping" => "shouldnt_be_copied",
                },
              },
            },
          },
          template_version:
            create(
              :template_version,
              requirement_template: different_req_template,
              status: "deprecated",
              deprecation_reason: "new_publish",
            ),
        )
      end

      # mapping of a deprecated template version from same requirement template
      let!(:existing_mapping_deprecated_same_req_template_ver) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: {
            "sku" => {
              "id" => "1",
              "requirements" => {
                "code2" => {
                  "id" => "2",
                  "local_system_mapping" => "should_be_copied_deprecated_same_template",
                },
              },
            },
            "sku2" => {
              "id" => "2",
              "requirements" => {
                "code3" => {
                  "id" => "3",
                  "local_system_mapping" => "shouldnt_be_copied",
                },
                "code4" => {
                  "id" => "4",
                  "local_system_mapping" => "shouldnt_be_copied",
                },
              },
            },
          },
          template_version:
            create(
              :template_version,
              requirement_template: template_version.requirement_template,
              status: "deprecated",
              deprecation_reason: "new_publish",
            ),
        )
      end

      # mapping of a published template version
      let!(:existing_mapping_published_ver) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: {
            "sku2" => {
              "id" => "2",
              "requirements" => {
                "code3" => {
                  "id" => "3",
                  "local_system_mapping" => "should_be_copied_published",
                },
                "code4" => {
                  "id" => "4",
                  "local_system_mapping" => "shouldnt_be_copied",
                },
              },
            },
          },
          template_version: create(:template_version, requirement_template: different_req_template),
        )
      end
      # mapping of a published template version from same requirement template
      let!(:existing_mapping_published_same_req_template_ver) do
        create(
          :jurisdiction_integration_requirements_mapping,
          jurisdiction: jurisdiction,
          requirements_mapping: {
            "sku2" => {
              "id" => "2",
              "requirements" => {
                "code4" => {
                  "id" => "4",
                  "local_system_mapping" => "should_be_copied_published_same_req_template",
                },
              },
            },
          },
          template_version: create(:template_version, requirement_template: template_version.requirement_template),
        )
      end

      let!(:new_mapping) do
        create(
          :jurisdiction_integration_requirements_mapping,
          template_version: template_version,
          jurisdiction: jurisdiction,
        )
      end

      it "initializes requirements_mapping and successfully copies mapping from current published template from same requirement template" do
        expect(new_mapping.requirements_mapping.dig("sku2", "requirements", "code4", "local_system_mapping")).to eq(
          "should_be_copied_published_same_req_template",
        )
      end

      it "initializes requirements_mapping and successfully copies mapping from any current published template when there is no published template from same requirement template" do
        expect(new_mapping.requirements_mapping.dig("sku2", "requirements", "code3", "local_system_mapping")).to eq(
          "should_be_copied_published",
        )
      end

      it "initializes requirements_mapping and successfully copies mapping from deprecated template from same requirement template when there is no published template" do
        expect(new_mapping.requirements_mapping.dig("sku", "requirements", "code2", "local_system_mapping")).to eq(
          "should_be_copied_deprecated_same_template",
        )
      end
      it "initializes requirements_mapping and successfully copies mapping from any deprecated template when there is no published template or deprecated template from same requirement template" do
        expect(new_mapping.requirements_mapping.dig("sku", "requirements", "code", "local_system_mapping")).to eq(
          "should_be_copied_deprecated",
        )
      end
    end
  end
end
