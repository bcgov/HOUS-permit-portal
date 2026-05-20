# frozen_string_literal: true

class UpdateMapPositions < ActiveRecord::Migration[7.2]
  ORIGIN = [0.0, 0.0].freeze

  def up
    Jurisdiction.where(map_position: nil).update_all(map_position: ORIGIN)
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
