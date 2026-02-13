class CleanupEarlyAccessColumns < ActiveRecord::Migration[7.1]
  # IMPORTANT: Only run this migration AFTER the draft system has been validated
  # and all early access data has been migrated successfully.
  #
  # This removes the legacy columns and tables that are no longer needed
  # after the early access -> draft version migration.

  def up
    # Remove the old FK column from the renamed table (was early_access_previews)
    if column_exists?(
         :template_version_previews,
         :early_access_requirement_template_id
       )
      remove_index :template_version_previews,
                   name:
                     "index_early_access_previews_on_template_id_and_previewer_id",
                   if_exists: true
      remove_column :template_version_previews,
                    :early_access_requirement_template_id
    end

    # Make template_version_id required now that migration is complete
    change_column_null :template_version_previews, :template_version_id, false

    # Remove early-access-specific columns from requirement_templates
    # (these have been moved to template_versions)
    remove_column :requirement_templates, :assignee_id, :uuid, if_exists: true
    remove_column :requirement_templates, :public, :boolean, if_exists: true
    remove_column :requirement_templates,
                  :site_configuration_id,
                  :uuid,
                  if_exists: true
  end

  def down
    add_column :requirement_templates, :assignee_id, :uuid
    add_column :requirement_templates, :public, :boolean, default: false
    add_column :requirement_templates, :site_configuration_id, :uuid

    change_column_null :template_version_previews, :template_version_id, true
    add_column :template_version_previews,
               :early_access_requirement_template_id,
               :uuid
    add_index :template_version_previews,
              %i[early_access_requirement_template_id previewer_id],
              name:
                "index_early_access_previews_on_template_id_and_previewer_id",
              unique: true
  end
end
