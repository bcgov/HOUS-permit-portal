class CreateIntegrationMappingNotifications < ActiveRecord::Migration[7.1]
  def change
    create_table :integration_mapping_notifications, id: :uuid do |t|
      t.references :notifiable, polymorphic: true, null: false, type: :uuid
      t.references :template_version,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.string :front_end_path, null: true
      t.datetime :processed_at

      t.timestamps
    end
  end
end
