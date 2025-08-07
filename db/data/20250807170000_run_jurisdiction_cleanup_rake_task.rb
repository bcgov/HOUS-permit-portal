# frozen_string_literal: true

class RunJurisdictionCleanupRakeTask < ActiveRecord::Migration[7.1]
  def up
    require "rake"

    # Ensure rake tasks are loaded, then invoke the cleanup task
    Rails.application.load_tasks
    task = Rake::Task["jurisdiction:cleanup"]
    task.reenable
    task.invoke
  end

  def down
    # no-op: irreversible data migration
  end
end
