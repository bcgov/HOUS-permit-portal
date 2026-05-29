class AddQuestionDefinitionToRequirements < ActiveRecord::Migration[7.2]
  def change
    # Nullable link from a placement (Requirement) to its canonical definition.
    # NULL == today's exact behavior; strictly additive, no row migration.
    add_reference :requirements,
                  :question_definition,
                  type: :uuid,
                  null: true,
                  index: true,
                  foreign_key: {
                    on_delete: :nullify
                  }

    # Per-placement overrides applied on top of the linked definition's values.
    # Empty hash == inherit everything from the definition.
    add_column :requirements, :local_overrides, :jsonb, default: {}, null: false
  end
end
