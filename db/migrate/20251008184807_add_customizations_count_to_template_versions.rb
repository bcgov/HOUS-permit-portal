class AddCustomizationsCountToTemplateVersions < ActiveRecord::Migration[7.2]
  def up
    add_column :template_versions,
               :jurisdiction_template_version_customizations_count,
               :integer,
               default: 0,
               null: false
  end

  def down
    remove_column :template_versions,
                  :jurisdiction_template_version_customizations_count
  end
end
