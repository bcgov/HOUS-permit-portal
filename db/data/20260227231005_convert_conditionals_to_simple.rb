# frozen_string_literal: true

class ConvertConditionalsToSimple < ActiveRecord::Migration[7.2]
  def up
    ConditionalFormatMigrationService.new.call
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
