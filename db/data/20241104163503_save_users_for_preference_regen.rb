# frozen_string_literal: true

class SaveUsersForPreferenceRegen < ActiveRecord::Migration[7.1]
  def up
    User.find_each(&:save)
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
