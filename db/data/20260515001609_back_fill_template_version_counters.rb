# frozen_string_literal: true

class BackFillTemplateVersionCounters < ActiveRecord::Migration[7.2]
  def up
    say_with_time "Backfilling template version customization counters" do
      execute <<~SQL.squish
        UPDATE template_versions
        SET jurisdiction_template_version_customizations_count = (
          SELECT COUNT(*)
          FROM jurisdiction_template_version_customizations
          WHERE jurisdiction_template_version_customizations.template_version_id = template_versions.id
        )
      SQL
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
