# frozen_string_literal: true

class UpdateEulas3 < ActiveRecord::Migration[7.2]
  def up
    EulaUpdater.run
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
