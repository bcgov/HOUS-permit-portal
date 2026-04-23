class RequirementTemplateCopyService
  attr_accessor :requirement_template

  def initialize(requirement_template)
    @requirement_template = requirement_template
  end

  def build_requirement_template_from_existing(field_overrides = {})
    ActiveRecord::Base.transaction do
      new_template =
        RequirementTemplate.new(
          description:
            field_overrides[:description] ||
              "Copy of #{requirement_template.description}",
          nickname: field_overrides[:nickname],
          tag_list: requirement_template.tag_list,
          copied_from: requirement_template
        )

      return new_template unless new_template.valid?

      # Clone the sections and associate them with the new template
      requirement_template.requirement_template_sections.each do |section|
        new_section =
          new_template.requirement_template_sections.build(
            name: section.name,
            position: section.position,
            copied_from: section
          )

        # Associate existing requirement blocks with the new section
        section.requirement_blocks&.each do |block|
          new_section.requirement_blocks << block
        end
        new_section.save
      end

      # Save the new template first to get its ID
      new_template.save

      new_template
    end
  end
end
