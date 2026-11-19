class BackfillSubmitterCollaborations < ActiveRecord::Migration[7.2]
  # HUB-5783. A kept submission delegatee (collaborator_type 0) becomes an
  # application grant (kind 1). An assignee (collaborator_type 1) becomes a
  # block grant (kind 0). The integers are not copied. Review collaborations
  # stay. Block statuses stay.
  def up
    raise_if_any(
      <<~SQL.squish,
        SELECT COUNT(*)
        FROM permit_collaborations
        INNER JOIN collaborators
          ON collaborators.id = permit_collaborations.collaborator_id
        INNER JOIN permit_applications
          ON permit_applications.id = permit_collaborations.permit_application_id
        WHERE #{submission_collaborator_rows}
          AND (
            permit_applications.permit_project_id IS NULL
            OR permit_collaborations.collaborator_type IS NULL
            OR permit_collaborations.collaborator_type NOT IN (0, 1)
            OR (
              permit_collaborations.collaborator_type = 1
              AND NULLIF(
                BTRIM(permit_collaborations.assigned_requirement_block_id),
                ''
              ) IS NULL
            )
          )
      SQL
      "Submission collaboration is missing a project, a collaborator type, or an assigned block"
    )

    execute <<~SQL.squish
      INSERT INTO project_memberships (
        id,
        user_id,
        permit_project_id,
        access,
        contact_designation,
        created_at,
        updated_at
      )
      SELECT
        gen_random_uuid(),
        src.user_id,
        src.permit_project_id,
        0,
        0,
        NOW(),
        NOW()
      FROM (
        SELECT DISTINCT collaborators.user_id, permit_applications.permit_project_id
        FROM permit_collaborations
        INNER JOIN collaborators
          ON collaborators.id = permit_collaborations.collaborator_id
        INNER JOIN permit_applications
          ON permit_applications.id = permit_collaborations.permit_application_id
        WHERE #{submission_collaborator_rows}
      ) src
      WHERE NOT EXISTS (
        SELECT 1
        FROM project_memberships
        WHERE project_memberships.user_id = src.user_id
          AND project_memberships.permit_project_id = src.permit_project_id
      )
    SQL

    insert_grants(kind: 1, collaborator_type: 0, requirement_block_sql: "NULL")
    insert_grants(
      kind: 0,
      collaborator_type: 1,
      requirement_block_sql: "src.assigned_requirement_block_id"
    )

    execute <<~SQL.squish
      DELETE FROM permit_collaborations
      WHERE collaborator_id IN (
        SELECT id FROM collaborators WHERE collaboratorable_type = 'User'
      )
    SQL

    execute <<~SQL.squish
      DELETE FROM permit_project_collaborations
      WHERE collaborator_id IN (
        SELECT id FROM collaborators WHERE collaboratorable_type = 'User'
      )
    SQL

    execute <<~SQL.squish
      DELETE FROM permit_collaborations
      WHERE collaboration_type IS DISTINCT FROM 1
    SQL

    execute <<~SQL.squish
      DELETE FROM collaborators WHERE collaboratorable_type = 'User'
    SQL

    raise_if_any(
      "SELECT COUNT(*) FROM collaborators WHERE collaboratorable_type <> 'Jurisdiction'",
      "Unexpected collaboratorable_type rows remain"
    )
    raise_if_any(
      "SELECT COUNT(*) FROM collaborators WHERE jurisdiction_id IS NULL",
      "Collaborator jurisdiction_id is still null"
    )

    remove_index :collaborators,
                 name:
                   "idx_on_collaboratorable_type_collaboratorable_id_aa1cca136d"
    remove_index :collaborators, name: "index_collaborators_on_collaboratorable"
    remove_column :collaborators, :collaboratorable_type, :string
    remove_column :collaborators, :collaboratorable_id, :uuid
    change_column_null :collaborators, :jurisdiction_id, false

    remove_index :permit_collaborations,
                 name: "index_permit_collaborations_on_unique_columns"
    remove_index :permit_collaborations,
                 name: "index_permit_collaborations_on_collaboration_type"
    remove_column :permit_collaborations, :collaboration_type, :integer
    add_index :permit_collaborations,
              %i[
                permit_application_id
                collaborator_id
                collaborator_type
                assigned_requirement_block_id
              ],
              unique: true,
              where: "discarded_at IS NULL",
              name: "index_permit_collaborations_on_unique_columns"

    Collaborator.reindex
    PermitApplication.reindex
    ProjectMembership.reindex
    PermitProject.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def submission_collaborator_rows
    <<~SQL.squish
      collaborators.collaboratorable_type = 'User'
      AND permit_collaborations.collaboration_type = 0
      AND permit_collaborations.discarded_at IS NULL
    SQL
  end

  def insert_grants(kind:, collaborator_type:, requirement_block_sql:)
    block_select =
      if collaborator_type == 1
        "permit_collaborations.assigned_requirement_block_id"
      else
        "NULL::varchar AS assigned_requirement_block_id"
      end
    block_match =
      if collaborator_type == 1
        "AND project_grants.requirement_block_id = src.assigned_requirement_block_id"
      else
        ""
      end

    execute <<~SQL.squish
      INSERT INTO project_grants (
        id,
        project_membership_id,
        kind,
        permit_application_id,
        requirement_block_id,
        created_at,
        updated_at
      )
      SELECT
        gen_random_uuid(),
        project_memberships.id,
        #{kind},
        src.permit_application_id,
        #{requirement_block_sql},
        NOW(),
        NOW()
      FROM (
        SELECT DISTINCT
          collaborators.user_id,
          permit_applications.permit_project_id,
          permit_applications.id AS permit_application_id,
          #{block_select}
        FROM permit_collaborations
        INNER JOIN collaborators
          ON collaborators.id = permit_collaborations.collaborator_id
        INNER JOIN permit_applications
          ON permit_applications.id = permit_collaborations.permit_application_id
        WHERE #{submission_collaborator_rows}
          AND permit_collaborations.collaborator_type = #{collaborator_type}
      ) src
      INNER JOIN project_memberships
        ON project_memberships.user_id = src.user_id
        AND project_memberships.permit_project_id = src.permit_project_id
      WHERE project_memberships.access = 0
        AND NOT EXISTS (
          SELECT 1
          FROM project_grants
          WHERE project_grants.project_membership_id = project_memberships.id
            AND project_grants.permit_application_id = src.permit_application_id
            AND project_grants.kind = #{kind}
            #{block_match}
        )
    SQL
  end

  def raise_if_any(sql, message)
    count = select_value(sql)
    return if count.to_i.zero?

    raise message
  end
end
