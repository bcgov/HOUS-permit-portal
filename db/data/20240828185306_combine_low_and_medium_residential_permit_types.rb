# frozen_string_literal: true

class CombineLowAndMediumResidentialPermitTypes < ActiveRecord::Migration[7.1]
  def up
    PermitClassificationSeeder.seed
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
