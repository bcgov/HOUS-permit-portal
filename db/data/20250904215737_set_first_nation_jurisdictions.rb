# frozen_string_literal: true

class SetFirstNationJurisdictions < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction.where(locality_type: "first nation").update_all(
      first_nation: true
    )
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
