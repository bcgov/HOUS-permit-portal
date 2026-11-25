class AddSubmitterNoteToSubmissionVersions < ActiveRecord::Migration[7.2]
  def change
    add_column :submission_versions, :submitter_note, :text
  end
end
