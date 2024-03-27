class CreateSiteConfigurations < ActiveRecord::Migration[7.1]
  def change
    create_table :site_configurations, id: :uuid do |t|
      t.boolean :maintenance_mode
      t.string :maintenance_message

      t.timestamps
    end
  end
end
