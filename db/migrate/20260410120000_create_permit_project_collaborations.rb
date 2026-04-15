class CreatePermitProjectCollaborations < ActiveRecord::Migration[7.1]
  def up
    create_table :permit_project_collaborations,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      t.references :collaborator, null: false, foreign_key: true, type: :uuid
      t.datetime :discarded_at
      t.timestamps
    end

    add_index :permit_project_collaborations,
              %i[permit_project_id collaborator_id],
              unique: true,
              where: "discarded_at IS NULL",
              name: "index_project_collabs_on_project_and_collaborator"

    add_index :permit_project_collaborations, :discarded_at
    remove_reference :permit_projects,
                     :review_delegatee,
                     foreign_key: {
                       to_table: :collaborators
                     },
                     type: :uuid
  end

  def down
    add_reference :permit_projects,
                  :review_delegatee,
                  foreign_key: {
                    to_table: :collaborators
                  },
                  null: true,
                  type: :uuid

    drop_table :permit_project_collaborations
  end
end
