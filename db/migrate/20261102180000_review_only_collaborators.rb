class ReviewOnlyCollaborators < ActiveRecord::Migration[7.2]
  def up
    # TODO: HUB-5783 Convert existing submitter collaborations into project
    # memberships and grants instead of deleting them. This migration already
    # ran; do the conversion and the drops below in a new migration.
    # https://hous-bssb.atlassian.net/browse/HUB-5783
    # These deletes are commented out so the submission delegatees, submission
    # assignees, and the user-owned collaborator rows behind them survive until
    # that conversion exists. collaboratorable and collaboration_type stay too,
    # so the conversion can still tell those rows apart. Jurisdiction backfill
    # skips them, and jurisdiction_id stays nullable until they are gone.
    #
    # execute <<~SQL.squish
    #   DELETE FROM permit_collaborations
    #   WHERE collaborator_id IN (
    #     SELECT id FROM collaborators WHERE collaboratorable_type = 'User'
    #   )
    # SQL
    #
    # execute <<~SQL.squish
    #   DELETE FROM permit_project_collaborations
    #   WHERE collaborator_id IN (
    #     SELECT id FROM collaborators WHERE collaboratorable_type = 'User'
    #   )
    # SQL
    #
    # execute <<~SQL.squish
    #   DELETE FROM collaborators WHERE collaboratorable_type = 'User'
    # SQL
    #
    # execute <<~SQL.squish
    #   DELETE FROM permit_collaborations WHERE collaboration_type = 0
    # SQL
    #
    # execute <<~SQL.squish
    #   DELETE FROM permit_block_statuses WHERE collaboration_type = 0
    # SQL
    #
    # remaining =
    #   select_value(
    #     "SELECT COUNT(*) FROM collaborators WHERE collaboratorable_type <> 'Jurisdiction'"
    #   )
    # if remaining.to_i.positive?
    #   raise "Unexpected collaboratorable_type rows remain"
    # end

    add_column :collaborators, :jurisdiction_id, :uuid
    execute <<~SQL.squish
      UPDATE collaborators
      SET jurisdiction_id = collaboratorable_id
      WHERE collaboratorable_type = 'Jurisdiction'
    SQL
    # TODO: HUB-5783 change_column_null :collaborators, :jurisdiction_id, false
    add_index :collaborators,
              %i[user_id jurisdiction_id],
              unique: true,
              name: "index_collaborators_on_user_id_and_jurisdiction_id"
    add_index :collaborators, :jurisdiction_id
    add_foreign_key :collaborators, :jurisdictions

    # TODO: HUB-5783 Drop collaboratorable_type, collaboratorable_id, and
    # collaboration_type once submitter rows have been converted. Dropping them
    # now would erase the submission/review distinction, and the replacement
    # unique indexes would collide while both kinds of block status exist.
    #
    # remove_index :collaborators,
    #              name:
    #                "idx_on_collaboratorable_type_collaboratorable_id_aa1cca136d"
    # remove_index :collaborators, name: "index_collaborators_on_collaboratorable"
    # remove_column :collaborators, :collaboratorable_type, :string
    # remove_column :collaborators, :collaboratorable_id, :uuid
    #
    # remove_index :permit_collaborations,
    #              name: "index_permit_collaborations_on_unique_columns"
    # remove_index :permit_collaborations,
    #              name: "index_permit_collaborations_on_collaboration_type"
    # remove_column :permit_collaborations, :collaboration_type, :integer
    # add_index :permit_collaborations,
    #           %i[
    #             permit_application_id
    #             collaborator_id
    #             collaborator_type
    #             assigned_requirement_block_id
    #           ],
    #           unique: true,
    #           where: "discarded_at IS NULL",
    #           name: "index_permit_collaborations_on_unique_columns"
    #
    # remove_index :permit_block_statuses,
    #              name:
    #                "index_block_statuses_on_app_id_and_block_id_and_collab_type"
    # remove_column :permit_block_statuses, :collaboration_type, :integer
    # add_index :permit_block_statuses,
    #           %i[permit_application_id requirement_block_id],
    #           unique: true,
    #           name: "index_block_statuses_on_app_id_and_block_id"

    Collaborator.reindex
    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
