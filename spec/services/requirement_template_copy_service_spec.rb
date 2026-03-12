require "rails_helper"

RSpec.describe RequirementTemplateCopyService do
  describe "#build_requirement_template_from_existing" do
    it "uses whitelist class when overrides provide a type" do
      original =
        instance_double(
          "LiveRequirementTemplate",
          activity_id: "a-1",
          permit_type_id: "p-1",
          description: "Original",
          first_nations: false,
          requirement_template_sections: []
        )

      new_template =
        instance_double("EarlyAccessRequirementTemplate", valid?: false)
      allow(EarlyAccessRequirementTemplate).to receive(:new).and_return(
        new_template
      )
      allow(ActiveRecord::Base).to receive(:transaction).and_yield

      result =
        described_class.new(original).build_requirement_template_from_existing(
          type: "EarlyAccessRequirementTemplate"
        )

      expect(result).to eq(new_template)
      expect(EarlyAccessRequirementTemplate).to have_received(:new).with(
        hash_including(
          activity_id: "a-1",
          permit_type_id: "p-1",
          copied_from: original
        )
      )
    end

    it "clones sections and only associates allowed blocks when new template is valid" do
      block_allowed = instance_double("RequirementBlock", allowed_in: true)
      block_denied = instance_double("RequirementBlock", allowed_in: false)

      section =
        instance_double(
          "RequirementTemplateSection",
          name: "Section",
          position: 1,
          copied_from: nil,
          requirement_blocks: [block_allowed, block_denied]
        )

      sections_assoc = [section]

      sections_builder = double("SectionsBuilder")
      new_section = instance_double("RequirementTemplateSection")
      allow(new_section).to receive(:requirement_blocks).and_return([])
      allow(new_section).to receive(:save)
      allow(sections_builder).to receive(:build).and_return(new_section)

      new_template =
        instance_double(
          "LiveRequirementTemplate",
          valid?: true,
          requirement_template_sections: sections_builder,
          save: true
        )

      original =
        instance_double(
          "LiveRequirementTemplate",
          activity_id: "a-1",
          permit_type_id: "p-1",
          description: "Original",
          first_nations: false,
          class: LiveRequirementTemplate,
          requirement_template_sections: sections_assoc
        )

      allow(LiveRequirementTemplate).to receive(:new).and_return(new_template)
      allow(ActiveRecord::Base).to receive(:transaction).and_yield

      result =
        described_class.new(original).build_requirement_template_from_existing(
          description: "Copy",
          nickname: "Nick"
        )

      expect(result).to eq(new_template)
      expect(new_section.requirement_blocks).to include(block_allowed)
      expect(new_section.requirement_blocks).not_to include(block_denied)
    end
  end
end
