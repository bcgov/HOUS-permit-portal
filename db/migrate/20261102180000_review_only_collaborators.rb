class ReviewOnlyCollaborators < ActiveRecord::Migration[7.2]
  def up
    # Submitter rows stay until
    # 20261117180000_backfill_submitter_collaborations converts them into
    # memberships and grants and drops collaboratorable and
    # permit_collaborations.collaboration_type. Block statuses keep both sides.

    add_column :collaborators, :jurisdiction_id, :uuid
    execute <<~SQL.squish
      UPDATE collaborators
      SET jurisdiction_id = collaboratorable_id
      WHERE collaboratorable_type = 'Jurisdiction'
    SQL
    add_index :collaborators,
              %i[user_id jurisdiction_id],
              unique: true,
              name: "index_collaborators_on_user_id_and_jurisdiction_id"
    add_index :collaborators, :jurisdiction_id
    add_foreign_key :collaborators, :jurisdictions

    Collaborator.reindex
    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
