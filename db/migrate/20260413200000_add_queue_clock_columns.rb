class AddQueueClockColumns < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications,
               :queue_time_seconds,
               :integer,
               default: 0,
               null: false

    add_column :permit_applications,
               :queue_clock_started_at,
               :datetime,
               null: true

    add_column :permit_projects,
               :queue_time_seconds,
               :integer,
               default: 0,
               null: false

    add_column :permit_projects, :queue_clock_started_at, :datetime, null: true
  end
end
