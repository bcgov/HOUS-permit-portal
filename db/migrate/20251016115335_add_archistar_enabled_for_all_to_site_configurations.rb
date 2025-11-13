class AddArchistarEnabledForAllToSiteConfigurations < ActiveRecord::Migration[
  7.1
]
  def up
    unless column_exists?(
             :site_configurations,
             :archistar_enabled_for_all_jurisdictions
           )
      add_column :site_configurations,
                 :archistar_enabled_for_all_jurisdictions,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(
         :site_configurations,
         :archistar_enabled_for_all_jurisdictions
       )
      remove_column :site_configurations,
                    :archistar_enabled_for_all_jurisdictions
    end
  end
end
