class CreatePermitCollaborations < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_collaborations, id: :uuid do |t|
      t.references :collaborator, null: false, foreign_key: true, type: :uuid
      t.references :permit_application,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.integer :collaboration_type, default: 0
      t.integer :collaborator_type, default: 0
      t.string :assigned_requirement_block_id, null: true

      t.timestamps
    end

    add_index :permit_collaborations, :collaboration_type
    add_index :permit_collaborations, :collaborator_type
    add_index :permit_collaborations,
              %i[
                permit_application_id
                collaborator_id
                collaboration_type
                collaborator_type
                assigned_requirement_block_id
              ],
              unique: true,
              name: "index_permit_collaborations_on_unique_columns"
  end
end
