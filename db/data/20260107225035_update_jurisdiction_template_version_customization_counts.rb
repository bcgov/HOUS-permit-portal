# frozen_string_literal: true

class UpdateJurisdictionTemplateVersionCustomizationCounts < ActiveRecord::Migration[
  7.2
]
  def up
    TemplateVersion.find_each do |tv|
      unique_live_count =
        tv.jurisdiction_template_version_customizations.live.distinct.count(
          :jurisdiction_id
        )
      tv.update_columns(
        jurisdiction_template_version_customizations_count: unique_live_count
      )
    end

    # Reindex RequirementTemplates to ensure search index reflects the new counts
    RequirementTemplate.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
