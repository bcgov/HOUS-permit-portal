# frozen_string_literal: true

class QuestionDefinitionBlueprint < Blueprinter::Base
  identifier :id

  fields :label,
         :hint,
         :instructions,
         :input_type,
         :input_options,
         :requirement_code,
         :review_state,
         :forked_from_id,
         :owner_id,
         :created_at,
         :updated_at,
         :discarded_at

  field :placements_count do |question_definition|
    question_definition.placements_count
  end
end
