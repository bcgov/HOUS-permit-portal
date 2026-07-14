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

  describe "snapshot artifacts" do
    it "requires a valid canonical snapshot on creation" do
      template_version =
        build(:template_version, snapshot_json: {}, form_json: {})

      expect(template_version).not_to be_valid
      expect(template_version.errors[:snapshot_json]).to include(
        "Unsupported snapshot schema: nil"
      )
    end

    it "requires a compiled form artifact on creation" do
      template_version = build(:template_version, form_json: nil)

      expect(template_version).not_to be_valid
      expect(template_version.errors[:form_json]).to include(
        "Compiled form must be a JSON object"
      )
    end

    it "keeps snapshot_json and form_json immutable after creation" do
      template_version = create(:template_version)

      expect(
        template_version.update(
          snapshot_json: template_version.snapshot_json.merge("template" => {}),
          form_json: {
            "components" => []
          }
        )
      ).to be(false)
      expect(template_version.errors[:snapshot_json]).to include(
        "cannot be changed after creation"
      )
      expect(template_version.errors[:form_json]).to include(
        "cannot be changed after creation"
      )
    end
  end

  describe "draft snapshot presentation" do
    let(:visible_block) { create(:requirement_block) }
    let(:hidden_block) do
      create(:requirement_block, hide_in_early_access: true)
    end
    let(:requirement_template) { create(:requirement_template) }

    let(:snapshot_json) do
      {
        "schema_version" => 1,
        "template" => {
          "id" => requirement_template.id,
          "nickname" => requirement_template.nickname,
          "tags" => []
        },
        "sections" => [
          {
            "id" => SecureRandom.uuid,
            "name" => "Section 1",
            "position" => 1,
            "blocks" => [
              {
                "id" => SecureRandom.uuid,
                "block_id" => visible_block.id,
                "position" => 1
              },
              {
                "id" => SecureRandom.uuid,
                "block_id" => hidden_block.id,
                "position" => 2
              }
            ]
          }
        ],
        "blocks" => {
          visible_block.id => {
            "id" => visible_block.id,
            "name" => visible_block.name
          },
          hidden_block.id => {
            "id" => hidden_block.id,
            "name" => hidden_block.name
          }
        }
      }
    end
    let(:form_json) do
      {
        "id" => requirement_template.id,
        "components" => [
          {
            "id" => SecureRandom.uuid,
            "type" => "container",
            "components" => [
              {
                "id" => visible_block.id,
                "type" => "panel",
                "title" => visible_block.display_name
              },
              {
                "id" => hidden_block.id,
                "type" => "panel",
                "title" => hidden_block.display_name
              }
            ]
          }
        ]
      }
    end

    let(:template_version) do
      create(
        :template_version,
        requirement_template: requirement_template,
        status: :draft,
        snapshot_json: snapshot_json,
        form_json: form_json
      )
    end

    it "strips hide_in_early_access blocks from display projections" do
      expect(
        template_version.snapshot_blocks(display: true).keys
      ).to contain_exactly(visible_block.id)

      section_blocks =
        template_version
          .snapshot_outline(display: true)
          .fetch("requirement_template_sections")
          .first[
          "template_section_blocks"
        ]
      expect(section_blocks.map { |b| b.dig("requirement_block", "id") }).to eq(
        [visible_block.id]
      )

      panel_ids =
        template_version
          .snapshot_form_json(display: true)
          .fetch("components")
          .first
          .fetch("components")
          .map { |component| component["id"] }
      expect(panel_ids).to eq([visible_block.id])
    end

    it "does not mutate the stored snapshot artifacts" do
      template_version.snapshot_outline(display: true)
      template_version.snapshot_form_json(display: true)

      template_version.reload
      expect(
        template_version.snapshot_json.fetch("blocks").keys
      ).to contain_exactly(visible_block.id, hidden_block.id)
      expect(
        template_version
          .snapshot_json
          .fetch("sections")
          .first
          .fetch("blocks")
          .size
      ).to eq(2)
      expect(
        template_version.form_json["components"].first["components"].size
      ).to eq(2)
    end

    it "omits flagged blocks from focused draft responses" do
      detail =
        TemplateVersionBlueprint.render_as_hash(
          template_version,
          view: :extended
        )
      expect(
        detail[:outline]["requirement_template_sections"].first[
          "template_section_blocks"
        ].map { |b| b.dig("requirement_block", "id") }
      ).to eq([visible_block.id])

      preview =
        TemplateVersionBlueprint.render_as_hash(
          template_version,
          view: :form_preview
        )
      expect(
        preview[:form_json]["components"].first["components"].map do |c|
          c["id"]
        end
      ).to eq([visible_block.id])
    end

    it "keeps flagged blocks in published responses" do
      published =
        create(
          :template_version,
          requirement_template: requirement_template,
          status: :published,
          snapshot_json: snapshot_json,
          form_json: form_json
        )

      rendered =
        TemplateVersionBlueprint.render_as_hash(published, view: :extended)

      expect(
        rendered[:outline]["requirement_template_sections"].first[
          "template_section_blocks"
        ].map { |block| block.dig("requirement_block", "id") }
      ).to contain_exactly(visible_block.id, hidden_block.id)
    end
  end
end
