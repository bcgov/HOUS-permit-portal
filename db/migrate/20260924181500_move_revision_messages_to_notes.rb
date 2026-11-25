class MoveRevisionMessagesToNotes < ActiveRecord::Migration[7.2]
  def change
    add_column :notes, :kind, :string, null: false, default: "meeting"
    add_column :notes, :published_at, :datetime
    add_index :notes,
              %i[noteable_type noteable_id kind],
              unique: true,
              where: "kind <> 'meeting'",
              name: "index_notes_on_revision_message_kind"

    remove_column :submission_versions, :applicant_note, :text
    remove_column :submission_versions, :submitter_note, :text
  end
end
