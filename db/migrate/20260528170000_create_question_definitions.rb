class CreateQuestionDefinitions < ActiveRecord::Migration[7.2]
  def change
    create_table :question_definitions, id: :uuid do |t|
      t.string :label, null: false
      t.string :hint
      t.text :instructions
      t.integer :input_type, null: false
      t.jsonb :input_options, default: {}, null: false
      t.string :requirement_code
      t.integer :review_state, default: 0, null: false
      t.references :owner,
                   type: :uuid,
                   null: true,
                   index: true,
                   foreign_key: {
                     to_table: :users,
                     on_delete: :nullify
                   }
      t.references :forked_from,
                   type: :uuid,
                   null: true,
                   index: true,
                   foreign_key: {
                     to_table: :question_definitions,
                     on_delete: :nullify
                   }
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :question_definitions, :requirement_code
    add_index :question_definitions, :review_state
    add_index :question_definitions, :discarded_at
  end
end
