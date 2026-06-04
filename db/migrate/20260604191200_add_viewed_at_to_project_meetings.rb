class AddViewedAtToProjectMeetings < ActiveRecord::Migration[7.2]
  def change
    add_column :project_meetings, :viewed_at, :datetime, null: true
    add_index :project_meetings, :viewed_at
  end
end
