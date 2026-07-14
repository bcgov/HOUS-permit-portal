# frozen_string_literal: true

class BackfillTemplateVersionSnapshotJson < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:template_versions, :snapshot_json)
      raise "template_versions.snapshot_json must exist before backfill"
    end

    TemplateVersion.reset_column_information
    result = TemplateVersionSnapshot::Backfill.call
    say "Backfilled #{result.backfilled} template versions and verified #{result.verified}."
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
