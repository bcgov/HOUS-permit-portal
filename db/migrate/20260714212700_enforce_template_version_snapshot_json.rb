# frozen_string_literal: true

class EnforceTemplateVersionSnapshotJson < ActiveRecord::Migration[7.2]
  def up
    TemplateVersion.reset_column_information
    null_form_count =
      select_value(
        "SELECT COUNT(*) FROM template_versions WHERE form_json IS NULL"
      ).to_i
    if null_form_count.positive?
      raise "Cannot enforce template version artifacts: #{null_form_count} rows have NULL form_json"
    end

    TemplateVersionSnapshot::Backfill.call

    change_column_default :template_versions, :form_json, from: {}, to: nil
    change_column_null :template_versions, :snapshot_json, false
    change_column_null :template_versions, :form_json, false
    add_check_constraint :template_versions,
                         "COALESCE(snapshot_json ->> 'schema_version', '') = '1'",
                         name: "template_versions_snapshot_schema_v1"
    add_check_constraint :template_versions,
                         "jsonb_typeof(form_json) = 'object'",
                         name: "template_versions_form_json_object"
  end

  def down
    remove_check_constraint :template_versions,
                            name: "template_versions_form_json_object"
    remove_check_constraint :template_versions,
                            name: "template_versions_snapshot_schema_v1"
    change_column_null :template_versions, :form_json, true
    change_column_null :template_versions, :snapshot_json, true
    change_column_default :template_versions, :form_json, from: nil, to: {}
  end
end
