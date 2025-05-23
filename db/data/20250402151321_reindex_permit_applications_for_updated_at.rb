# frozen_string_literal: true

class ReindexPermitApplicationsForUpdatedAt < ActiveRecord::Migration[7.1]
  def up
    PermitApplication.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
