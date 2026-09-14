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

  # List/search: block names only. Nesting templates here made every index row
  # pull the full blast radius (slow + fat JSON the table never reads).
  view :extended do
    field :requirement_blocks do |requirement_question|
      RequirementQuestionBlueprint.serialize_usage_blocks(
        requirement_question,
        include_templates: false
      )
    end
  end

  # Show/modal: blocks + the permit templates that use them.
  view :with_usage do
    field :requirement_blocks do |requirement_question|
      RequirementQuestionBlueprint.serialize_usage_blocks(
        requirement_question,
        include_templates: true
      )
    end
  end

  def self.serialize_usage_blocks(requirement_question, include_templates:)
    blocks =
      if include_templates
        # Fresh query so we can eager-load the template tree in one go.
        requirement_question
          .requirement_blocks
          .kept
          .distinct
          .includes(requirement_templates: :published_template_version)
          .to_a
      elsif requirement_question.association(:requirement_blocks).loaded?
        # Searchkick already includes requirement_blocks — don't re-query.
        requirement_question.requirement_blocks.select(&:kept?).uniq(&:id)
      else
        requirement_question.requirement_blocks.kept.distinct.to_a
      end

    blocks
      .sort_by { |block| block.name.to_s.downcase }
      .map do |block|
        payload = { id: block.id, name: block.name }
        next payload unless include_templates

        # Through-assoc includes discarded templates; drop them here (usually few).
        templates =
          block
            .requirement_templates
            .select(&:kept?)
            .uniq(&:id)
            .sort_by { |rt| rt.nickname.to_s.downcase }

        payload.merge(
          requirement_templates:
            templates.map do |rt|
              {
                id: rt.id,
                nickname: rt.nickname,
                # Live published version on the template (not a historical snapshot).
                published: rt.published_template_version.present?
              }
            end
        )
      end
  end
end
