class PermitApplication::FormJsonService
  attr_accessor :form_json
  attr_reader :permit_application

  def initialize(permit_application:)
    @permit_application = permit_application
    @form_json = permit_application.template_version.form_json.deep_dup
  end

  def call
    remove_empty_blocks
    remove_empty_sections
    set_step_code_requirement
    return self
  end

  private

  def remove_empty_blocks
    return form_json if empty_block_ids.empty?

    form_json["components"].each do |component|
      next unless component["components"].present?

      component["components"].delete_if { |sub_component| empty_block_ids.include?(sub_component["id"]) }
    end
  end

  def remove_empty_sections
    form_json["components"].delete_if { |component| component["components"].blank? || component["components"].empty? }

    form_json
  end

  def set_step_code_requirement(hash = form_json)
    if hash.is_a?(Hash)
      if energy_step_keys.any? { |key| hash["key"]&.end_with?(key) }
        hash["validate"] = { "required" => permit_application.energy_step_code_required? }
      end
    end

    hash["components"].each { |component| set_step_code_requirement(component) } if hash["components"].is_a?(Array)
  end

  def energy_step_keys
    @energy_step_keys ||= %w[
      energy_step_code_method
      energy_step_code_tool_part_9
      energy_step_code_report_file
      energy_step_code_h2000_file
    ]
  end

  def empty_block_ids
    @empty_block_ids ||=
      permit_application
        .template_version
        .requirement_blocks_json
        .map do |rb_id, requirement_block|
          next if requirement_block["requirements"].blank?

          has_only_elective_fields = requirement_block["requirements"].all? { |requirement| requirement["elective"] }

          next unless has_only_elective_fields

          enabled_elective_field_ids =
            permit_application.form_customizations&.dig(
              "requirement_block_changes",
              rb_id,
              "enabled_elective_field_ids",
            ) || []

          # remove the block if no elective fields are enabled
          next rb_id if enabled_elective_field_ids.empty?

          # This check is to ensure that the enabled elective fields are valid, i.e. they exist in the requirement block
          any_enabled_elective_field_valid =
            enabled_elective_field_ids.any? do |elective_field_id|
              requirement_block["requirements"].any? { |requirement| elective_field_id == requirement["id"] }
            end

          # remove the block if no enabled elective fields are valid
          rb_id unless any_enabled_elective_field_valid
        end
        .compact
  end
end
