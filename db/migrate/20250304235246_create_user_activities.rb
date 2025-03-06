class CreateUserActivities < ActiveRecord::Migration[7.1]
  def change
    create_table :user_activities, id: :uuid do |t|
      t.integer :user_id
      t.string :feature_name
      t.string :jurisdiction
      t.string :action
      t.datetime :timestamp

      t.timestamps
    end
  end
end
