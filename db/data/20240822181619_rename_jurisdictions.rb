# frozen_string_literal: true

class RenameJurisdictions < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction
      .where(name: %w[Summerland Fernie])
      .find_each do |jurisdiction|
        updated_locality_type =
          jurisdiction.locality_type.gsub(/corporation of the/i, "").strip
        jurisdiction.update(locality_type: updated_locality_type)
      end
  end

  def down
    Jurisdiction
      .where(name: %w[Summerland Fernie])
      .find_each do |jurisdiction|
        updated_locality_type =
          "Corporation of the #{jurisdiction.locality_type}"
        jurisdiction.update(locality_type: updated_locality_type)
      end
  end
end
