class CreatePermitBlockStatuses < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_block_statuses, id: :uuid do |t|
      t.belongs_to :permit_application,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.string :requirement_block_id, null: false
      t.integer :status, null: false, default: 0
      t.integer :collaboration_type, null: false, default: 0

      t.timestamps
    end

    add_index :permit_block_statuses,
              %i[permit_application_id requirement_block_id collaboration_type],
              unique: true,
              name:
                "index_block_statuses_on_app_id_and_block_id_and_collab_type"
  end
end
