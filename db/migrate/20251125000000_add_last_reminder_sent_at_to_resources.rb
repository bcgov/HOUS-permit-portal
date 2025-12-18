class AddLastReminderSentAtToResources < ActiveRecord::Migration[7.2]
  def change
    add_column :resources, :last_reminder_sent_at, :datetime
    add_index :resources, :last_reminder_sent_at
  end
end
