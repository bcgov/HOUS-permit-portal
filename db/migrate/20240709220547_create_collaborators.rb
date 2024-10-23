class CreateCollaborators < ActiveRecord::Migration[7.1]
  def change
    create_table :collaborators, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :collaboratorable,
                   polymorphic: true,
                   null: false,
                   type: :uuid

      t.timestamps
    end

    add_index :collaborators, %i[collaboratorable_type collaboratorable_id]
  end
end
