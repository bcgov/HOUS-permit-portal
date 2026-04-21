# frozen_string_literal: true

# After ConvertEarlyAccessToDraftVersions copies each EarlyAccessRequirementTemplate's
# published content into a draft TemplateVersion on the matching LiveRequirementTemplate,
# the original EA rows must be retired so they stop showing up in search results and UI
# listings. This migration soft-deletes every remaining EA requirement_template.
#
# Runs between the conversion migration (20260421165626) and the legacy column cleanup
# (20260421165700), so the `type` column and EA rows still exist when this runs.
#
# Remember to reindex after this runs:
#   RequirementTemplate.reindex
class RetireEarlyAccessRequirementTemplates < ActiveRecord::Migration[7.2]
  def up
    result = ActiveRecord::Base.connection.execute(<<~SQL)
      UPDATE requirement_templates
      SET discarded_at = NOW(), updated_at = NOW()
      WHERE type = 'EarlyAccessRequirementTemplate'
        AND discarded_at IS NULL
      RETURNING id
    SQL

    RequirementTemplate.reindex

    say "RetireEarlyAccessRequirementTemplates: discarded #{result.ntuples} EA requirement_templates."
    say "Reindex search after deploy: RequirementTemplate.reindex"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
