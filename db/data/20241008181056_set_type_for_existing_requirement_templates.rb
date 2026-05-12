# frozen_string_literal: true

class SetTypeForExistingRequirementTemplates < ActiveRecord::Migration[7.1]
  # No-op: the `type` column is removed in a later migration now that
  # `LiveRequirementTemplate` has been collapsed into `RequirementTemplate`.
  # Kept as an entry in the data_migrations log for historical completeness.
  def up
  end

  def down
  end
end
