# frozen_string_literal: true

class SeedJursidictionsHDD < ActiveRecord::Migration[7.1]
  def up
    StepCode::Part3::V0::Seeders::JurisdictionHDD.seed!
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
