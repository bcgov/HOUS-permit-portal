class RenameEarlyAccessPreviewsToTemplateVersionPreviews < ActiveRecord::Migration[
  7.1
]
  def change
    # Rename the table
    rename_table :early_access_previews, :template_version_previews

    # Add the new foreign key column pointing to template_versions
    add_reference :template_version_previews,
                  :template_version,
                  type: :uuid,
                  foreign_key: true,
                  null: true

    # Add a new unique index for the template_version-based lookup
    add_index :template_version_previews,
              %i[template_version_id previewer_id],
              name: "index_tv_previews_on_tv_id_and_previewer_id",
              unique: true

    # Note: We keep the old early_access_requirement_template_id column for now
    # so Phase 3 data migration can read the old FK and populate template_version_id.
    # Phase 5 cleanup will remove the old column and its index.
  end
end
