# frozen_string_literal: true

class SeedJursidictionsHDD < ActiveRecord::Migration[7.1]
  def up
    # Legacy jurisdiction-level HDD values are no longer stored.
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
