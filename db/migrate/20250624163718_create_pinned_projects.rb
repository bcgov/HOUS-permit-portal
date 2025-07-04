class CreatePinnedProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :pinned_projects, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :permit_project, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    add_index :pinned_projects, %i[user_id permit_project_id], unique: true
  end
end
