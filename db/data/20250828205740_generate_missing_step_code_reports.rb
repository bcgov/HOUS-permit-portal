# frozen_string_literal: true

class GenerateMissingStepCodeReports < ActiveRecord::Migration[7.1]
  def up
    require "rake"

    Rails.application.load_tasks
    task = Rake::Task["step_codes:generate_missing_reports"]
    task.reenable
    task.invoke
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
