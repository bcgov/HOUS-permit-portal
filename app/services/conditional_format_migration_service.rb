# frozen_string_literal: true

class ConditionalFormatMigrationService
  VALID_FORMIO_OPERATORS = %w[
    isEqual
    isNotEqual
    greaterThan
    greaterThanOrEqual
    lessThan
    lessThanOrEqual
    isDateEqual
    isNotDateEqual
    dateGreaterThan
    dateGreaterThanOrEqual
    dateLessThan
    dateLessThanOrEqual
    isEmpty
    isNotEmpty
  ].freeze

  Result =
    Struct.new(
      :requirements_updated,
      :template_versions_updated,
      keyword_init: true
    )

  def call
    req_count = migrate_requirement_source_data
    tv_count = migrate_template_version_form_json
    Result.new(
      requirements_updated: req_count,
      template_versions_updated: tv_count
    )
  end

  # Adds "operator" => "isEqual" to every requirement whose
  # input_options["conditional"] has a "when" key but no valid operator yet.
  def migrate_requirement_source_data
    count = 0
    Requirement
      .where("input_options -> 'conditional' ->> 'when' IS NOT NULL")
      .find_each do |req|
        cond = req.input_options["conditional"]
        if cond["operator"].present? &&
             VALID_FORMIO_OPERATORS.include?(cond["operator"])
          next
        end

        cond["operator"] = "isEqual"
        req.update_column(:input_options, req.input_options)
        count += 1
      end
    count
  end

  # Converts every legacy conditional in stored template_versions.form_json
  # from { when, eq, show } to { show, conjunction, conditions: [...] }.
  def migrate_template_version_form_json
    count = 0
    TemplateVersion
      .where("form_json IS NOT NULL AND form_json != '{}'::jsonb")
      .find_each do |tv|
        form_json = tv.form_json.deep_dup
        if convert_component_conditionals(form_json)
          tv.update_column(:form_json, form_json)
          count += 1
        end
      end
    count
  end

  # Recursively converts legacy conditionals in a FormIO component tree.
  # Returns true if any conversion was performed.
  def convert_component_conditionals(component)
    return false unless component.is_a?(Hash)

    changed = false

    if (cond = component["conditional"]).is_a?(Hash) && cond["when"].present?
      show = cond.key?("show") ? cond["show"] : !cond["hide"]
      component["conditional"] = {
        "show" => !!show,
        "conjunction" => "all",
        "conditions" => [
          {
            "component" => cond["when"],
            "operator" => "isEqual",
            "value" => cond["eq"]
          }
        ]
      }
      changed = true
    end

    component["components"]&.each do |child|
      changed = true if convert_component_conditionals(child)
    end

    changed
  end
end
