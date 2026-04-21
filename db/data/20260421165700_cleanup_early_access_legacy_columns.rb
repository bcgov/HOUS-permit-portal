# frozen_string_literal: true

# Runs after ConvertEarlyAccessToDraftVersions. Supersedes the body of
# db/migrate/20260212000005_cleanup_early_access_columns.rb (now a no-op).

class CleanupEarlyAccessLegacyColumns < ActiveRecord::Migration[7.2]
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
    if column_exists?(:template_version_previews, :template_version_id)
      change_column_null :template_version_previews, :template_version_id, false
    end

    # Remove early-access-specific columns from requirement_templates
    # (these have been moved to template_versions)
    remove_column :requirement_templates, :assignee_id, :uuid, if_exists: true
    remove_column :requirement_templates, :public, :boolean, if_exists: true
    remove_column :requirement_templates,
                  :site_configuration_id,
                  :uuid,
                  if_exists: true

    # The STI `type` column drop is handled by the schema migration
    # 20260421200000_drop_type_from_requirement_templates.rb. Left out here
    # so this data migration is column-level only.
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
