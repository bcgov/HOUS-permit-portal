class AddCodeComplianceEnabledToSiteConfigurations < ActiveRecord::Migration[
  7.1
]
  def up
    unless column_exists?(:site_configurations, :code_compliance_enabled)
      add_column :site_configurations,
                 :code_compliance_enabled,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:site_configurations, :code_compliance_enabled)
      remove_column :site_configurations, :code_compliance_enabled
    end
  end
end
