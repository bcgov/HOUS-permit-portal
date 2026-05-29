# frozen_string_literal: true

class RequirementBlueprint < Blueprinter::Base
  identifier :id

  # Placement-only fields are read straight off the row.
  fields :requirement_code,
         :required,
         :related_content,
         :required_for_in_person_hint,
         :required_for_multiple_owners,
         :elective,
         :updated_at,
         :created_at

  # Shareable fields are read through the question-bank resolver so a linked
  # placement reflects its canonical definition (overlaid with local_overrides).
  # For unlinked placements these return the row's own values unchanged.
  field :label do |requirement|
    requirement.resolved_label
  end

  field :input_type do |requirement|
    requirement.resolved_input_type
  end

  field :hint do |requirement|
    requirement.resolved_hint
  end

  field :instructions do |requirement|
    requirement.resolved_instructions
  end

  field :form_json do |requirement|
    requirement.to_form_json
  end

  field :input_options do |requirement|
    resolved_input_options = requirement.resolved_input_options

    unless resolved_input_options.dig(
             "computed_compliance",
             "options_map"
           ).is_a?(Hash)
      resolved_input_options
    else
      input_options_dup = resolved_input_options.deep_dup

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

  # ── Question-bank linkage metadata (authoring surface only) ───────────────
  #
  # Kept OUT of the default view on purpose: the default view is what the
  # publish pipeline snapshots into TemplateVersion#requirement_blocks_json, and
  # that artifact must stay byte-identical for unlinked placements. The
  # Requirements Library reads the :authoring view to get linkage info.
  view :authoring do
    field :question_definition_id

    field :is_shared do |requirement|
      requirement.linked_to_question_definition?
    end

    field :local_overrides do |requirement|
      requirement.local_overrides
    end

    field :shared_review_state do |requirement|
      requirement.question_definition&.review_state
    end
  end
end
