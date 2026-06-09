class AddViewedAtToProjectMeetings < ActiveRecord::Migration[7.2]
  def change
    add_column :project_meetings, :viewed_at, :datetime, null: true
    add_column :project_meetings, :contact_method, :integer, null: true
    add_index :project_meetings, :viewed_at
    add_index :project_meetings, :contact_method
  end
end
