# frozen_string_literal: true

class RequirementBlueprint < Blueprinter::Base
  identifier :id
  fields :requirement_code,
         :label,
         :input_type,
         :hint,
         :required,
         :related_content,
         :required_for_in_person_hint,
         :required_for_multiple_owners,
         :elective,
         :updated_at,
         :created_at

  field :form_json do |requirement|
    requirement.to_form_json
  end

  field :input_options do |requirement|
    unless requirement
             .input_options
             .dig("computed_compliance", "options_map")
             .is_a?(Hash)
      requirement.input_options
    else
      input_options_dup = requirement.input_options.deep_dup

      # this needs to be done to prevent camelizing the computed compliance options map keys
      # as conversion results in unexpected behaviour
      input_options_dup["computed_compliance"][
        "options_map"
      ] = input_options_dup["computed_compliance"][
        "options_map"
      ].transform_keys { |key| "compliance-options-map-prefix-#{key.to_s}" }

      input_options_dup
    end
  end
end
