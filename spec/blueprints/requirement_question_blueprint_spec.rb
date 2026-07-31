# frozen_string_literal: true

require "rails_helper"

RSpec.describe RequirementQuestionBlueprint do
  describe "extended view requirement_blocks" do
    it "nests kept permit templates under each linked requirement block" do
      question = create(:requirement_question)
      category = create(:template_category, label: "Residential")
      used_block = create(:requirement_block, name: "Agent authorization")
      unused_block = create(:requirement_block, name: "Orphan block")
      discarded_block = create(:requirement_block, name: "Archived block")
      discarded_block.discard

      create(
        :requirement,
        requirement_question: question,
        requirement_block: used_block
      )
      create(
        :requirement,
        requirement_question: question,
        requirement_block: unused_block
      )
      create(
        :requirement,
        requirement_question: question,
        requirement_block: discarded_block
      )

      kept_template =
        create(
          :requirement_template,
          nickname: "Residential - Part 9 - New Build",
          template_category: category
        )
      discarded_template =
        create(:requirement_template, nickname: "Retired template")
      discarded_template.discard

      section =
        create(
          :requirement_template_section,
          requirement_template: kept_template
        )
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: used_block
      )

      discarded_section =
        create(
          :requirement_template_section,
          requirement_template: discarded_template
        )
      create(
        :template_section_block,
        requirement_template_section: discarded_section,
        requirement_block: used_block
      )

      payload =
        described_class.render_as_hash(question, view: :extended)[
          :requirement_blocks
        ]

      expect(payload.map { |block| block[:name] }).to eq(
        ["Agent authorization", "Orphan block"]
      )

      agent_block =
        payload.find { |block| block[:name] == "Agent authorization" }
      expect(agent_block[:requirement_templates]).to contain_exactly(
        {
          id: kept_template.id,
          nickname: "Residential - Part 9 - New Build",
          template_category_label: "Residential"
        }
      )

      orphan_block = payload.find { |block| block[:name] == "Orphan block" }
      expect(orphan_block[:requirement_templates]).to eq([])
    end
  end
end
