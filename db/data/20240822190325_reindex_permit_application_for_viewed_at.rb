# frozen_string_literal: true

class ReindexPermitApplicationForViewedAt < ActiveRecord::Migration[7.1]
  def up
    PermitApplication.reindex
    User.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
