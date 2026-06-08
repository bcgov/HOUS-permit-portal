# frozen_string_literal: true

# Runs after ConvertEarlyAccessToDraftVersions. Supersedes the body of
# db/migrate/20260212000005_cleanup_early_access_columns.rb (now a no-op).

class CleanupEarlyAccessLegacyColumns < ActiveRecord::Migration[7.2]
  def up
    # Clear "Copy of ..." descriptions on LiveRequirementTemplates that were
    # auto-created as containers by ConvertEarlyAccessToDraftVersions (earlier
    # revisions of that migration inherited description/nickname from the EA
    # template, which itself carried a RequirementTemplateCopyService-prepended
    # "Copy of " string). We only touch live templates that:
    #   * share permit_type/activity/first_nations with an EA template, AND
    #   * have the *same* description as that EA (so the value was clearly
    #     inherited, not authored), AND
    #   * have no published template_version (i.e. they exist only as a
    #     container for the new draft — never previously published).
    if column_exists?(:requirement_templates, :type)
      cleared = execute(<<~SQL).cmd_tuples
          UPDATE requirement_templates AS live
          SET description = NULL,
              nickname = NULL,
              updated_at = NOW()
          FROM requirement_templates AS ea
          WHERE live.type = 'LiveRequirementTemplate'
            AND ea.type = 'EarlyAccessRequirementTemplate'
            AND live.permit_type_id = ea.permit_type_id
            AND live.activity_id = ea.activity_id
            AND live.first_nations = ea.first_nations
            AND live.description IS NOT DISTINCT FROM ea.description
            AND NOT EXISTS (
              SELECT 1 FROM template_versions tv
              WHERE tv.requirement_template_id = live.id
                AND tv.status = 1
            )
        SQL
      if cleared.positive?
        say "Cleared EA-inherited description/nickname on #{cleared} LiveRequirementTemplate(s). Reindex with RequirementTemplate.reindex."
      end
    end

    # Defense in depth: ConvertEarlyAccessToDraftVersions should have
    # populated every template_version_previews.template_version_id, but if
    # any truly-orphaned rows remain (e.g. their source EA template was
    # hard-deleted or pre-dates the rename migration), delete them before
    # enforcing NOT NULL.
    if column_exists?(:template_version_previews, :template_version_id)
      orphan_count =
        execute(
          "DELETE FROM template_version_previews WHERE template_version_id IS NULL"
        ).cmd_tuples
      if orphan_count.positive?
        say "Deleted #{orphan_count} orphaned template_version_previews with NULL template_version_id"
      end
    end

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
