class MigrateEarlyAccessToDraftVersions < ActiveRecord::Migration[7.2]
  # Data conversion moved to db/data/20260421165626_convert_early_access_to_draft_versions.rb
  # Run: rails db:migrate && rails data:migrate (seeds also run data migrations).
  def up
  end

  def down
  end
end
