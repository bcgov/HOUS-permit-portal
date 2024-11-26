class AddCollaborationNotifictionPreference < ActiveRecord::Migration[7.1]
  def change
    add_column :preferences,
               :enable_in_app_collaboration_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_collaboration_notification,
               :boolean,
               default: true
  end
end
