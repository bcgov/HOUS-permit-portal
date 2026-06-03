class AddPmRecipientEmailsToJurisdictions < ActiveRecord::Migration[7.2]
  def change
    add_column :jurisdictions,
               :project_meeting_notification_recipient_emails,
               :jsonb,
               default: [],
               null: false
  end
end
