class RenameProjectMeetingClosedAtToWithdrawnAt < ActiveRecord::Migration[7.1]
  def change
    rename_column :project_meetings, :closed_at, :withdrawn_at
  end
end
