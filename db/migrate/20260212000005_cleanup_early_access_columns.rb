class CleanupEarlyAccessColumns < ActiveRecord::Migration[7.2]
  # Column cleanup moved to db/data/20260421165700_cleanup_early_access_legacy_columns.rb so it runs
  # after the data migration (ConvertEarlyAccessToDraftVersions) in rails data:migrate.
  def up
  end

  def down
  end
end
