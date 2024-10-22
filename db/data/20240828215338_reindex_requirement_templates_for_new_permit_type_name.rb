# frozen_string_literal: true

class ReindexRequirementTemplatesForNewPermitTypeName < ActiveRecord::Migration[
  7.1
]
  def up
    RequirementTemplate.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
