require "rails_helper"

RSpec.describe RequirementTemplateStructureRestoreService do
  let!(:template) { create(:full_requirement_template, sections_count: 2) }
  let!(:template_version) do
    create(
      :template_version,
      requirement_template: template,
      denormalized_template_json:
        RequirementTemplateBlueprint.render_as_hash(
          template,
          view: :template_snapshot
        ),
      status: :published
    )
  end

  describe "#call!" do
    it "rebuilds sections, block order, and conditionals from the snapshot" do
      first_tsb =
        template
          .requirement_template_sections
          .order(:position)
          .first
          .template_section_blocks
          .order(:position)
          .first
      conditional = {
        "when_block_id" => first_tsb.requirement_block_id,
        "when_requirement_code" => "energy_step_code",
        "eq" => "yes",
        "show" => true
      }
      first_tsb.update!(conditional: conditional)

      # Snapshot after conditional is set
      template_version.update!(
        denormalized_template_json:
          RequirementTemplateBlueprint.render_as_hash(
            template.reload,
            view: :template_snapshot
          )
      )

      # Capture expected layout before destroy_all clears join rows
      expected_names =
        template.requirement_template_sections.order(:position).pluck(:name)
      expected_block_ids_by_section =
        template
          .requirement_template_sections
          .order(:position)
          .map do |section|
            section
              .template_section_blocks
              .order(:position)
              .pluck(:requirement_block_id)
          end
      first_block_id = first_tsb.requirement_block_id

      # Mutate live layout so restore has something to reverse
      template.requirement_template_sections.destroy_all
      leftover_section =
        template.requirement_template_sections.create!(
          name: "Leftover",
          position: 0
        )
      leftover_section.template_section_blocks.create!(
        requirement_block: create(:requirement_block),
        position: 0
      )

      result = described_class.new(template_version.reload).call!

      expect(result.id).to eq(template.id)
      restored = result.requirement_template_sections.order(:position).to_a
      expect(restored.map(&:name)).to eq(expected_names)

      restored.each_with_index do |section, i|
        expect(
          section
            .template_section_blocks
            .order(:position)
            .map(&:requirement_block_id)
        ).to eq(expected_block_ids_by_section[i])
      end

      restored_first_tsb =
        restored.first.template_section_blocks.find_by(
          requirement_block_id: first_block_id
        )
      expect(restored_first_tsb.conditional).to eq(conditional)
    end

    it "aborts with no partial writes when a block is missing" do
      snapshot = template_version.denormalized_template_json.deep_dup
      missing_id = SecureRandom.uuid
      snapshot["requirement_template_sections"].first[
        "template_section_blocks"
      ].first[
        "requirement_block"
      ][
        "id"
      ] = missing_id
      template_version.update!(denormalized_template_json: snapshot)

      section_ids_before =
        template.requirement_template_sections.pluck(:id).sort

      expect { described_class.new(template_version).call! }.to raise_error(
        RequirementTemplateStructureRestoreError,
        /missing or archived/
      )

      expect(
        template.reload.requirement_template_sections.pluck(:id).sort
      ).to eq(section_ids_before)
    end

    it "aborts when a referenced block is discarded" do
      block =
        template.requirement_template_sections.first.requirement_blocks.first
      block.discard

      expect { described_class.new(template_version).call! }.to raise_error(
        RequirementTemplateStructureRestoreError,
        /missing or archived/
      )
    end

    it "raises when the snapshot is empty" do
      template_version.update!(denormalized_template_json: {})

      expect { described_class.new(template_version).call! }.to raise_error(
        RequirementTemplateStructureRestoreError,
        /no layout snapshot/
      )
    end

    it "raises when the snapshot is malformed" do
      template_version.update!(
        denormalized_template_json: {
          "requirement_template_sections" => "not-an-array"
        }
      )

      expect { described_class.new(template_version).call! }.to raise_error(
        RequirementTemplateStructureRestoreError,
        /invalid/
      )
    end

    it "raises when the parent template is discarded" do
      template.discard

      expect { described_class.new(template_version).call! }.to raise_error(
        RequirementTemplateStructureRestoreError,
        /missing or archived/
      )
    end

    it "accepts camelCase snapshot keys" do
      snake =
        RequirementTemplateBlueprint.render_as_hash(
          template,
          view: :template_snapshot
        )
      camel = snake.deep_transform_keys { |k| k.to_s.camelize(:lower) }
      template_version.update!(denormalized_template_json: camel)

      template.requirement_template_sections.destroy_all

      result = described_class.new(template_version).call!
      expect(result.requirement_template_sections.count).to be > 0
    end
  end
end
