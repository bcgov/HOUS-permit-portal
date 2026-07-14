# frozen_string_literal: true

class AddSnapshotJsonToTemplateVersions < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:template_versions, :snapshot_json)
      add_column :template_versions, :snapshot_json, :jsonb
    end
  end

  def down
    if column_exists?(:template_versions, :snapshot_json)
      remove_column :template_versions, :snapshot_json
    end
  end
end
