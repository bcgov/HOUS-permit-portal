# frozen_string_literal: true

class DropLegacyTemplateVersionJsonColumns < ActiveRecord::Migration[7.2]
  def up
    invalid_count = select_value(<<~SQL).to_i
        SELECT COUNT(*)
        FROM template_versions
        WHERE snapshot_json IS NULL
           OR snapshot_json = '{}'::jsonb
           OR snapshot_json->>'schema_version' IS DISTINCT FROM '1'
      SQL

    if invalid_count.positive?
      raise "Cannot remove legacy template version snapshots: #{invalid_count} rows do not have valid snapshot_json v1"
    end

    if column_exists?(:template_versions, :denormalized_template_json)
      remove_column :template_versions, :denormalized_template_json
    end
    if column_exists?(:template_versions, :requirement_blocks_json)
      remove_column :template_versions, :requirement_blocks_json
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration,
          "Legacy template version snapshots cannot be reconstructed losslessly"
  end
end
