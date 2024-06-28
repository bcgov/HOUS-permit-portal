class CreateRevisionRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :revision_requests, id: :uuid do |t|
      t.integer :reason_code
      t.jsonb :requirement_json
      t.jsonb :submission_json
      t.string :comment, limit: 350
      t.references :permit_application, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
