class TemplateVersioningService
  attr_accessor :requirement_template

  def initialize(requirement_template)
    self.requirement_template = requirement_template
  end

  def schedule(version_date)
    if !is_valid_schedule_version_date?(version_date)
      raise StandardError.new("Version date must be in the future and after latest scheduled version date")
    end

    template_version =
      requirement_template.template_versions.build(
        denormalized_template_json: RequirementTemplateBlueprint.render_as_json(requirement_template),
        form_json: requirement_template.to_form_json,
        requirement_blocks_json: form_requirement_blocks_json,
        version_diff: diff_of_current_changes_and_last_version,
        version_date: version_date,
        status: "scheduled",
      )

    raise StandardError.new(template_version.errors.full_messages.join(", ")) if !template_version.save

    template_version
  end

  private

  def form_requirement_blocks_json
    requirement_blocks_json = {}

    requirement_template.requirement_template_sections.each do |template_section|
      template_section.requirement_blocks.each do |requirement_block|
        requirement_blocks_json[requirement_block.id] = RequirementBlockBlueprint.render_as_hash(requirement_block)
      end
    end

    requirement_blocks_json.to_json
  end

  def is_valid_schedule_version_date?(version_date)
    last_version = requirement_template.template_versions.order(version_date: :desc).first

    version_date > Date.current && (last_version.blank? || version_date <= last_version.version_date)
  end

  def diff_of_current_changes_and_last_version
    # TODO
    return {}
  end
end
