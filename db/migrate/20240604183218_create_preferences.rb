class CreatePreferences < ActiveRecord::Migration[7.1]
  def change
    create_table :preferences, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.boolean :enable_in_app_new_template_version_publish_notification,
                default: true
      t.boolean :enable_email_new_template_version_publish_notification,
                default: true
      t.boolean :enable_in_app_customization_update_notification, default: true
      t.boolean :enable_email_customization_update_notification, default: true

      t.timestamps
    end
  end

  def data
    User.all.each(&:save)
  end
end
