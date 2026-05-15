class AddQaToolsEnabledToSiteConfigurations < ActiveRecord::Migration[7.1]
  def up
    unless column_exists?(:site_configurations, :qa_tools_enabled)
      add_column :site_configurations,
                 :qa_tools_enabled,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:site_configurations, :qa_tools_enabled)
      remove_column :site_configurations, :qa_tools_enabled
    end
  end
end
