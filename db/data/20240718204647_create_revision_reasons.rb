# frozen_string_literal: true

class CreateRevisionReasons < ActiveRecord::Migration[7.1]
  def up
    RevisionReasonSeeder.seed
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
