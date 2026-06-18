class AddReleaseNoteNotificationToPreference < ActiveRecord::Migration[7.2]
  def change
    add_column :preferences,
               :enable_in_app_release_note_publish_notification,
               :boolean,
               default: true
  end
end
