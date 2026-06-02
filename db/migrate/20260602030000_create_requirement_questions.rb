class CreateRequirementQuestions < ActiveRecord::Migration[7.2]
  def change
    create_table :requirement_questions, id: :uuid do |t|
      t.string :requirement_code, null: false
      t.string :label
      t.integer :input_type, null: false
      t.jsonb :input_options, default: {}, null: false
      t.string :hint
      t.text :instructions
      t.boolean :shared, default: false, null: false
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :requirement_questions, :discarded_at
    add_index :requirement_questions, :shared
    add_index :requirement_questions, :requirement_code

    add_reference :requirements,
                  :requirement_question,
                  null: true,
                  foreign_key: true,
                  type: :uuid
  end
end
