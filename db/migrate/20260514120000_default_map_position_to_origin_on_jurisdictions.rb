# frozen_string_literal: true

class DefaultMapPositionToOriginOnJurisdictions < ActiveRecord::Migration[7.2]
  ORIGIN = [0.0, 0.0].freeze

  def up
    change_column_default :jurisdictions, :map_position, from: nil, to: ORIGIN
  end

  def down
    change_column_default :jurisdictions, :map_position, from: ORIGIN, to: nil
  end
end
