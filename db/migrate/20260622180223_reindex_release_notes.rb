class ReindexReleaseNotes < ActiveRecord::Migration[7.2]
  def change
    ReleaseNote.reindex
  end
end
