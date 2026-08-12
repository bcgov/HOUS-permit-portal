# frozen_string_literal: true

class BackfillSubmissionContacts < ActiveRecord::Migration[7.2]
  def up
    execute <<~SQL.squish
      UPDATE submission_contacts
      SET type = 'ApplicationSubmissionContact'
      WHERE type IS NULL OR type = ''
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
