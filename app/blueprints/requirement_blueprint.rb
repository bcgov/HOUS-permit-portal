# frozen_string_literal: true

class RequirementBlueprint < Blueprinter::Base
  identifier :id
  fields :requirement_code,
         :requirement_question_id,
         :required,
         :related_content,
         :required_for_in_person_hint,
         :required_for_multiple_owners,
         :elective,
         :updated_at,
         :created_at

  association :requirement_question, blueprint: RequirementQuestionBlueprint

  field :label do |requirement|
    requirement.effective_label
  end

  field :input_type do |requirement|
    requirement.effective_input_type
  end

  field :hint do |requirement|
    requirement.effective_hint
  end

  field :instructions do |requirement|
    requirement.effective_instructions
  end

  # Bank defaults / placement overrides — only when linked (FK present).
  # Linked vs local is requirement_question_id; no separate "shared" flag.
  field :default_hint do |requirement|
    requirement.requirement_question&.hint
  end

  field :default_instructions do |requirement|
    requirement.requirement_question&.instructions
  end

  field :hint_override do |requirement|
    requirement.read_attribute(:hint) if requirement.requirement_question
  end

  field :instructions_override do |requirement|
    if requirement.requirement_question
      requirement.read_attribute(:instructions)
    end
  end

  field :form_json do |requirement|
    requirement.to_form_json
  end

  field :input_options do |requirement|
    input_options = requirement.effective_input_options
    unless input_options.dig("computed_compliance", "options_map").is_a?(Hash)
      input_options
    else
      input_options_dup = input_options.deep_dup

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
