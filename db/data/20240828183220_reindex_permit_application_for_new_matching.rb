# frozen_string_literal: true

class ReindexPermitApplicationForNewMatching < ActiveRecord::Migration[7.1]
  def up
    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
