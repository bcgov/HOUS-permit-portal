class AddDiscardedAtToPermitCollaborations < ActiveRecord::Migration[7.2]
  def change
    add_column :permit_collaborations, :discarded_at, :datetime
    add_index :permit_collaborations, :discarded_at

    remove_index :permit_collaborations,
                 name: "index_permit_collaborations_on_unique_columns"
    add_index :permit_collaborations,
              %i[
                permit_application_id
                collaborator_id
                collaboration_type
                collaborator_type
                assigned_requirement_block_id
              ],
              unique: true,
              name: "index_permit_collaborations_on_unique_columns",
              where: "discarded_at IS NULL"
  end
end
