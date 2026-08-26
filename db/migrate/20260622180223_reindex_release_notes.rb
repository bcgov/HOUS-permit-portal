class ReindexReleaseNotes < ActiveRecord::Migration[7.2]
  def change
    # ReleaseNote.enum :release_type is backed by a column added in
    # 20260807161100. Loading the model here before that column exists raises.
    # That later migration reindexes after adding the column.
    return unless column_exists?(:release_notes, :release_type)

    ReleaseNote.reindex
  end
end
