# frozen_string_literal: true

class CreateAndIndexDefaultSandboxes < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction.find_each(&:save)
    Jurisdiction.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
