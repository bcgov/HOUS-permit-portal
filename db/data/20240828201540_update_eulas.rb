# frozen_string_literal: true

class UpdateEulas < ActiveRecord::Migration[7.1]
  def up
    EulaUpdater.run(should_override_existing: false)
  end

  def down
  end
end
