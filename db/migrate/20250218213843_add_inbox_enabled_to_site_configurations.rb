class AddInboxEnabledToSiteConfigurations < ActiveRecord::Migration[7.1]
  def change
    add_column :site_configurations, :inbox_enabled, :boolean, default: false, null: false
  end
end
