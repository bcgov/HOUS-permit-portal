class CreateTemplateVersionFeedbacks < ActiveRecord::Migration[7.1]
  def change
    create_table :template_version_feedbacks, id: :uuid do |t|
      t.references :template_version,
                   type: :uuid,
                   null: false,
                   foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.integer :sentiment, null: false, default: 2 # enum: approve: 0, request_changes: 1, comment: 2
      t.text :body, null: false
      t.boolean :resolved, default: false, null: false
      t.references :resolved_by,
                   type: :uuid,
                   foreign_key: {
                     to_table: :users
                   },
                   null: true

      t.timestamps
    end

    add_index :template_version_feedbacks,
              %i[template_version_id created_at],
              name: "index_tv_feedbacks_on_tv_id_and_created_at"
  end
end
