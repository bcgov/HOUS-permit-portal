class PermitApplication::FormJsonService
  attr_accessor :form_json
  attr_reader :permit_application, :current_user

  def initialize(permit_application:, current_user: nil)
    @permit_application = permit_application
    @form_json = permit_application.template_version.form_json.deep_dup
    @current_user = current_user
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

      component["components"].delete_if do |sub_component|
        empty_block_ids.include?(sub_component["id"])
      end
    end
  end

  def remove_empty_sections
    form_json["components"].delete_if do |component|
      component["components"].blank? || component["components"].empty?
    end

    form_json
  end

  def set_step_code_requirement(hash = form_json)
    if hash.is_a?(Hash)
      if energy_step_keys.any? { |key| hash["key"]&.end_with?(key) }
        hash["validate"] = {
          "required" => permit_application.energy_step_code_required?
        }
      end
    end

    if hash["components"].is_a?(Array)
      hash["components"].each do |component|
        set_step_code_requirement(component)
      end
    end
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

          has_only_elective_fields =
            requirement_block["requirements"].all? do |requirement|
              requirement["elective"]
            end

          next unless has_only_elective_fields

          enabled_elective_field_ids =
            permit_application.form_customizations&.dig(
              "requirement_block_changes",
              rb_id,
              "enabled_elective_field_ids"
            ) || []

          # remove the block if no elective fields are enabled
          next rb_id if enabled_elective_field_ids.empty?

          # This check is to ensure that the enabled elective fields are valid, i.e. they exist in the requirement block
          any_enabled_elective_field_valid =
            enabled_elective_field_ids.any? do |elective_field_id|
              requirement_block["requirements"].any? do |requirement|
                elective_field_id == requirement["id"]
              end
            end

          # remove the block if no enabled elective fields are valid
          rb_id unless any_enabled_elective_field_valid
        end
        .compact || []

    # If the user is not passed in then we don't remove requirement blocks based on further collaboration permissions.
    return @empty_block_ids if current_user.blank?

    permissions =
      permit_application.submission_requirement_block_edit_permissions(
        user_id: current_user.id
      ) || []

    return @empty_block_ids if permissions == :all

    requirement_block_ids =
      permit_application&.template_version&.requirement_blocks_json&.keys || []

    @empty_block_ids =
      (@empty_block_ids + (requirement_block_ids - permissions)).uniq

    @empty_block_ids
  end
end
