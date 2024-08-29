class RequirementTemplateCopyService
  attr_accessor :requirement_template

  def initialize(requirement_template)
    @requirement_template = requirement_template
  end

  def build_requirement_template_from_existing(field_overrides = {})
    ActiveRecord::Base.transaction do
      # Clone the basic attributes of the original template
      new_template =
        RequirementTemplate.new(
          activity_id: requirement_template.activity_id,
          permit_type_id: requirement_template.permit_type_id,
          description: field_overrides[:description] || "Copy of #{requirement_template.description}",
          first_nations: field_overrides[:first_nations] || requirement_template.first_nations,
        )

      # Save the new template first to get its ID
      new_template.save

      return new_template unless new_template.valid?

      # Clone the sections and associate them with the new template
      requirement_template.requirement_template_sections.each do |section|
        new_section = new_template.requirement_template_sections.build(name: section.name, position: section.position)

        # Associate existing requirement blocks with the new section
        section.requirement_blocks.each { |block| new_section.requirement_blocks << block }
      end
      new_template
    end
  end
end
