class AddCustomizationsCountToTemplateVersions < ActiveRecord::Migration[7.2]
  def up
    add_column :template_versions,
               :jurisdiction_template_version_customizations_count,
               :integer,
               default: 0,
               null: false

    # SQL backfill: avoid loading ::TemplateVersion — the app model may declare
    # columns (e.g. change_significance) that do not exist yet at this version.
    execute <<~SQL.squish
      UPDATE template_versions tv
      SET jurisdiction_template_version_customizations_count = counts.cnt
      FROM (
        SELECT template_version_id, COUNT(*) AS cnt
        FROM jurisdiction_template_version_customizations
        GROUP BY template_version_id
      ) AS counts
      WHERE tv.id = counts.template_version_id
    SQL
  end

  def down
    remove_column :template_versions,
                  :jurisdiction_template_version_customizations_count
  end
end
