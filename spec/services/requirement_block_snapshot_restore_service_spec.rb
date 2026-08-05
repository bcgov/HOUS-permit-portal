require "rails_helper"

RSpec.describe RequirementBlockSnapshotRestoreService do
  let!(:template) { create(:full_requirement_template, sections_count: 1) }
  let!(:block) do
    template.requirement_template_sections.first.requirement_blocks.first
  end
  let!(:template_version) do
    blocks_json = {}
    template.requirement_template_sections.each do |section|
      section.requirement_blocks.each do |requirement_block|
        blocks_json[
          requirement_block.id
        ] = RequirementBlockBlueprint.render_as_hash(
          requirement_block,
          parent_key: section.key
        )
      end
    end

    create(
      :template_version,
      requirement_template: template,
      status: :published,
      requirement_blocks_json: blocks_json,
      denormalized_template_json:
        RequirementTemplateBlueprint.render_as_hash(
          template,
          view: :template_snapshot
        )
    )
  end

  describe "#call!" do
    it "overwrites block fields and requirements from the snapshot" do
      original_label = block.requirements.order(:position).first.label
      original_name = block.name

      block.update!(name: "Changed name", display_name: "Changed display")
      block.requirements.order(:position).first.update!(label: "Changed label")
      create(
        :requirement,
        requirement_block: block,
        label: "Extra field added later",
        input_type: :text
      )

      result = described_class.new(template_version, block.id).call!

      expect(result.id).to eq(block.id)
      expect(result.name).to eq(original_name)
      expect(result.requirements.map(&:label)).to include(original_label)
      expect(result.requirements.map(&:label)).not_to include(
        "Extra field added later"
      )
    end

    it "restores a discarded block" do
      original_name = block.name
      block.discard

      result = described_class.new(template_version, block.id).call!

      expect(result).not_to be_discarded
      expect(result.name).to eq(original_name)
    end

    it "raises when the block is not in the snapshot" do
      expect {
        described_class.new(template_version, SecureRandom.uuid).call!
      }.to raise_error(
        RequirementBlockSnapshotRestoreError,
        /not present in the selected version/
      )
    end

    it "raises when the live block was hard-deleted" do
      block_id = block.id
      # destroy join rows then the block record itself
      TemplateSectionBlock.where(requirement_block_id: block_id).delete_all
      Requirement.where(requirement_block_id: block_id).delete_all
      RequirementBlock.where(id: block_id).delete_all

      expect {
        described_class.new(template_version, block_id).call!
      }.to raise_error(RequirementBlockSnapshotRestoreError, /no longer exists/)
    end

    it "normalizes compliance options_map prefixes from the blueprint" do
      req = block.requirements.order(:position).first
      req.update!(
        input_options: {
          "computed_compliance" => {
            "module" => "ParcelInfoExtractor",
            "value" => "FEATURE_AREA_SQM",
            "options_map" => {
              "raw_key" => "mapped"
            }
          }
        }
      )

      snapshot =
        RequirementBlockBlueprint.render_as_hash(
          block.reload,
          parent_key: "section"
        )
      template_version.update!(
        requirement_blocks_json: {
          block.id => snapshot
        }
      )

      # Mutate live options so restore has something to reverse
      req.update!(input_options: {})

      result = described_class.new(template_version, block.id).call!
      restored_req = result.requirements.find(req.id)

      expect(
        restored_req.input_options.dig("computed_compliance", "options_map")
      ).to eq({ "raw_key" => "mapped" })
    end
  end
end
