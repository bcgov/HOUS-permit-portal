class RequirementTemplateCopyService
  attr_accessor :requirement_template

  # Define a whitelist of permitted classes
  ALLOWED_CLASSES = {
    LiveRequirementTemplate.name => LiveRequirementTemplate,
    EarlyAccessRequirementTemplate.name => EarlyAccessRequirementTemplate
  }.freeze

  def initialize(requirement_template)
    @requirement_template = requirement_template
  end

  def build_requirement_template_from_existing(field_overrides = {})
    ActiveRecord::Base.transaction do
      # Clone the basic attributes of the original template
      # # Fetch the class from the whitelist or fallback to the existing class
      template_class =
        ALLOWED_CLASSES[field_overrides[:type]] || requirement_template.class

      new_template =
        template_class.new(
          activity_id: requirement_template.activity_id,
          permit_type_id: requirement_template.permit_type_id,
          description:
            field_overrides[:description] ||
              "Copy of #{requirement_template.description}",
          nickname: field_overrides[:nickname],
          first_nations:
            field_overrides[:first_nations] ||
              requirement_template.first_nations,
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
        section.requirement_blocks.each do |block|
          new_section.requirement_blocks << block
        end
      end

      # Save the new template first to get its ID
      new_template.save

      new_template
    end
  end
end
