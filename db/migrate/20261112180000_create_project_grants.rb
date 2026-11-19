class CreateProjectGrants < ActiveRecord::Migration[7.2]
  def change
    create_table :project_grants,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.references :project_membership,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      # kind: block=0, application=1, invite=2
      t.integer :kind, null: false
      t.references :permit_application, foreign_key: true, type: :uuid
      t.string :requirement_block_id
      t.timestamps
    end

    add_index :project_grants,
              %i[
                project_membership_id
                permit_application_id
                requirement_block_id
              ],
              unique: true,
              where: "kind = 0",
              name: "index_project_grants_one_block"
    add_index :project_grants,
              %i[project_membership_id permit_application_id],
              unique: true,
              where: "kind = 1",
              name: "index_project_grants_one_application"
    add_index :project_grants,
              :project_membership_id,
              unique: true,
              where: "kind = 2",
              name: "index_project_grants_one_invite"
  end
end
