require "rails_helper"

RSpec.describe RequirementBlockSnapshotRestoreService do
  let!(:template) { create(:full_requirement_template, sections_count: 1) }
  let!(:block) do
    template.requirement_template_sections.first.requirement_blocks.first
  end
  let!(:template_version) do
    create(
      :template_version,
      requirement_template: template,
      status: :published,
      requirement_blocks_json: snapshot_blocks_json(template)
    )
  end

  def snapshot_blocks_json(requirement_template)
    blocks_json = {}
    requirement_template.requirement_template_sections.each do |section|
      section.requirement_blocks.each do |requirement_block|
        blocks_json[
          requirement_block.id
        ] = RequirementBlockBlueprint.render_as_hash(
          requirement_block,
          parent_key: section.key
        )
      end
    end
    blocks_json
  end

  def refresh_version_snapshot!
    template_version.update!(
      requirement_blocks_json: snapshot_blocks_json(template.reload)
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
      refresh_version_snapshot!
      req.update!(input_options: {})

      result = described_class.new(template_version, block.id).call!
      restored_req = result.requirements.find(req.id)

      expect(
        restored_req.input_options.dig("computed_compliance", "options_map")
      ).to eq({ "raw_key" => "mapped" })
    end

    context "with question bank links" do
      let!(:bank_question) do
        create(
          :requirement_question,
          label: "Bank label",
          hint: "Bank default hint",
          instructions: "Bank default instructions",
          input_type: :text,
          input_options: {
            "value_options" => []
          }
        )
      end
      let!(:req) { block.requirements.order(:position).first }
      let!(:sibling_req) { block.requirements.order(:position).second }

      before do
        # Conditional must reference a real sibling requirement_code in this block
        req.update!(
          requirement_question: bank_question,
          label: "Bank label",
          input_type: :text,
          hint: nil,
          instructions: nil,
          input_options: {
            "conditional" => {
              "when" => sibling_req.requirement_code,
              "eq" => "yes",
              "show" => true,
              "operator" => "isEqual"
            }
          }
        )
        refresh_version_snapshot!
      end

      it "re-links the bank question and restores nil overrides as inherit" do
        req.update!(
          hint: "Temporary override",
          instructions: "Temporary instructions",
          requirement_question_id: nil
        )

        result = described_class.new(template_version.reload, block.id).call!
        restored = result.requirements.find(req.id)

        expect(restored.requirement_question_id).to eq(bank_question.id)
        expect(restored.read_attribute(:hint)).to be_nil
        expect(restored.read_attribute(:instructions)).to be_nil
        expect(restored.effective_hint).to eq("Bank default hint")
        expect(restored.input_options.dig("conditional", "when")).to eq(
          sibling_req.requirement_code
        )
        # Bank row unchanged
        expect(bank_question.reload.hint).to eq("Bank default hint")
        expect(bank_question.label).to eq("Bank label")
      end

      it "restores placement hint/instructions overrides without mutating the bank" do
        req.update!(
          hint: "Placement override",
          instructions: "Placement instructions"
        )
        refresh_version_snapshot!

        req.update!(hint: nil, instructions: nil)
        bank_question.update!(
          hint: "Live bank changed",
          label: "Live bank label"
        )

        result = described_class.new(template_version.reload, block.id).call!
        restored = result.requirements.find(req.id)

        expect(restored.requirement_question_id).to eq(bank_question.id)
        expect(restored.read_attribute(:hint)).to eq("Placement override")
        expect(restored.read_attribute(:instructions)).to eq(
          "Placement instructions"
        )
        expect(bank_question.reload.hint).to eq("Live bank changed")
        expect(bank_question.label).to eq("Live bank label")
        expect(restored.effective_label).to eq("Live bank label")
      end

      it "detaches and materializes effective wording when the bank question is gone" do
        refresh_version_snapshot!
        bank_id = bank_question.id
        req.update!(requirement_question_id: nil) # allow destroy
        RequirementQuestion.where(id: bank_id).delete_all

        service = described_class.new(template_version.reload, block.id)
        result = service.call!
        restored = result.requirements.find(req.id)

        expect(restored.requirement_question_id).to be_nil
        expect(restored.label).to eq("Bank label")
        expect(restored.hint).to eq("Bank default hint")
        expect(restored.instructions).to eq("Bank default instructions")
        expect(service.detached_requirement_codes).to include(
          restored.requirement_code
        )
      end

      it "detaches and materializes when the bank question is discarded" do
        refresh_version_snapshot!
        bank_question.discard

        result = described_class.new(template_version.reload, block.id).call!
        restored = result.requirements.find(req.id)

        expect(restored.requirement_question_id).to be_nil
        expect(restored.label).to eq("Bank label")
        expect(restored.hint).to eq("Bank default hint")
      end
    end
  end
end
