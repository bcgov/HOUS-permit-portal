class CreateNotes < ActiveRecord::Migration[7.1]
  def change
    create_table :notes, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :noteable, polymorphic: true, null: false, type: :uuid
      t.text :body, null: false

      t.timestamps
    end

    add_index :notes, %i[noteable_type noteable_id created_at]
    add_column :project_meetings,
               :notes_count,
               :integer,
               null: false,
               default: 0
  end
end
