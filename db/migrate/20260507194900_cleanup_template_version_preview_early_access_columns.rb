class CleanupTemplateVersionPreviewEarlyAccessColumns < ActiveRecord::Migration[
  7.2
]
  def up
    if column_exists?(:template_version_previews, :template_version_id)
      unmigrated_count =
        select_value(
          "SELECT COUNT(*) FROM template_version_previews WHERE template_version_id IS NULL"
        ).to_i

      if unmigrated_count.positive?
        raise ActiveRecord::IrreversibleMigration,
              "Cannot drop early_access_requirement_template_id while #{unmigrated_count} template_version_previews still have NULL template_version_id. Run early access conversion data migrations first."
      end

      change_column_null :template_version_previews, :template_version_id, false
    end

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
  end

  def down
    add_column :template_version_previews,
               :early_access_requirement_template_id,
               :uuid,
               null: true
    add_index :template_version_previews,
              %i[early_access_requirement_template_id previewer_id],
              name:
                "index_early_access_previews_on_template_id_and_previewer_id",
              unique: true
    change_column_null :template_version_previews, :template_version_id, true
  end
end
