# frozen_string_literal: true

class ReindexPermitProjectsForInboxTemplateIds < ActiveRecord::Migration[7.2]
  def up
    PermitProject.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
