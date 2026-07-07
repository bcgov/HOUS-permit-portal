class AddOverheatingToolEnabledToSiteConfigurations < ActiveRecord::Migration[
  7.1
]
  def up
    unless column_exists?(:site_configurations, :overheating_tool_enabled)
      add_column :site_configurations,
                 :overheating_tool_enabled,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:site_configurations, :overheating_tool_enabled)
      remove_column :site_configurations, :overheating_tool_enabled
    end
  end
end
