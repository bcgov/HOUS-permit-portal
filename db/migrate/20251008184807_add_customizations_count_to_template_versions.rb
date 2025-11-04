class AddCustomizationsCountToTemplateVersions < ActiveRecord::Migration[7.2]
  def up
    add_column :template_versions,
               :jurisdiction_template_version_customizations_count,
               :integer,
               default: 0,
               null: false

    # Backfill the counter cache for existing records
    TemplateVersion.find_each do |tv|
      TemplateVersion.reset_counters(
        tv.id,
        :jurisdiction_template_version_customizations
      )
    end
  end

  def down
    remove_column :template_versions,
                  :jurisdiction_template_version_customizations_count
  end
end
