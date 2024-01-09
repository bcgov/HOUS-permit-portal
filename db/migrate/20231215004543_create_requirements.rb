class CreateRequirements < ActiveRecord::Migration[7.1]
  def change
    create_table :requirements, id: :uuid do |t|
      t.string :requirement_code, null: false
      t.string :label
      t.integer :input_type, null: false
      t.jsonb :input_options, null: false, default: {}
      t.string :hint
      t.boolean :reusable, null: false, default: false
      t.boolean :required, null: false, default: true
      t.string :related_content
      t.boolean :required_for_in_person_hint, null: false, default: false
      t.boolean :required_for_multiple_owners, null: false, default: false

      t.timestamps
    end
  end
end
