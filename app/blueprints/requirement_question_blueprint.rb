# frozen_string_literal: true

class RequirementQuestionBlueprint < Blueprinter::Base
  identifier :id

  fields :requirement_code,
         :label,
         :input_type,
         :hint,
         :instructions,
         :name,
         :description,
         :discarded_at,
         :created_at,
         :updated_at

  field :input_options do |requirement_question|
    input_options = requirement_question.input_options
    unless input_options.dig("computed_compliance", "options_map").is_a?(Hash)
      input_options
    else
      input_options_dup = input_options.deep_dup
      input_options_dup["computed_compliance"][
        "options_map"
      ] = input_options_dup["computed_compliance"][
        "options_map"
      ].transform_keys { |key| "compliance-options-map-prefix-#{key}" }
      input_options_dup
    end
  end

  field :usage_count do |requirement_question|
    requirement_question.usage_count
  end

  field :association_list, name: :associations

  field :has_data_validation do |requirement_question|
    requirement_question.has_data_validation?
  end

  field :has_automated_compliance do |requirement_question|
    requirement_question.computed_compliance?
  end

  view :extended do
    field :requirement_blocks do |requirement_question|
      requirement_question.requirement_blocks.distinct.map do |block|
        { id: block.id, name: block.name }
      end
    end
  end
end
