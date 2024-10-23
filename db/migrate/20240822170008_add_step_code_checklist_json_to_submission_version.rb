class AddStepCodeChecklistJsonToSubmissionVersion < ActiveRecord::Migration[7.1]
  def change
    add_column :submission_versions,
               :step_code_checklist_json,
               :jsonb,
               default: {
               }
  end
end
