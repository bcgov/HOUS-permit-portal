class AddDraftStatusAndColumnsToTemplateVersions < ActiveRecord::Migration[7.1]
  def change
    # Note: status enum gains draft: 3 in the model code.
    # Existing values (scheduled: 0, published: 1, deprecated: 2) are unchanged.

    # Columns for draft workflow (assignee, preview visibility, standardization page link)
    add_reference :template_versions,
                  :assignee,
                  type: :uuid,
                  foreign_key: {
                    to_table: :users
                  },
                  null: true
    add_column :template_versions,
               :publicly_previewable,
               :boolean,
               default: false,
               null: false
    add_reference :template_versions,
                  :site_configuration,
                  type: :uuid,
                  foreign_key: true,
                  null: true

    # Columns for targeted notifications on publish
    add_column :template_versions, :change_notes, :text
    add_column :template_versions, :change_significance, :integer # enum: major: 0, minor: 1, patch: 2
    add_column :template_versions, :notification_scope, :integer # enum: all_jurisdictions: 0, specific_jurisdictions: 1, silent: 2
    add_column :template_versions,
               :notified_jurisdiction_ids,
               :uuid,
               array: true,
               default: []
  end
end
