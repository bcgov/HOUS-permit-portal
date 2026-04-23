require "rails_helper"

RSpec.describe RequirementTemplateCopyService do
  describe "#build_requirement_template_from_existing" do
    it "clones sections and associates all requirement blocks when new template is valid" do
      block_one = instance_double("RequirementBlock")
      block_two = instance_double("RequirementBlock")

      section =
        instance_double(
          "RequirementTemplateSection",
          name: "Section",
          position: 1,
          copied_from: nil,
          requirement_blocks: [block_one, block_two]
        )

      sections_assoc = [section]

      sections_builder = double("SectionsBuilder")
      new_section_blocks = []
      new_section = instance_double("RequirementTemplateSection")
      allow(new_section).to receive(:requirement_blocks).and_return(
        new_section_blocks
      )
      allow(new_section).to receive(:save)
      allow(sections_builder).to receive(:build).and_return(new_section)

      new_template =
        instance_double(
          "RequirementTemplate",
          valid?: true,
          requirement_template_sections: sections_builder,
          save: true
        )

      original =
        instance_double(
          "RequirementTemplate",
          description: "Original",
          tag_list: [],
          requirement_template_sections: sections_assoc
        )

      allow(RequirementTemplate).to receive(:new).and_return(new_template)
      allow(ActiveRecord::Base).to receive(:transaction).and_yield

      result =
        described_class.new(original).build_requirement_template_from_existing(
          description: "Copy",
          nickname: "Nick"
        )

      expect(result).to eq(new_template)
      expect(new_section_blocks).to contain_exactly(block_one, block_two)
    end
  end
end
