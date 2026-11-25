class AddReleaseTypeToReleaseNotes < ActiveRecord::Migration[7.2]
  def up
    add_column :release_notes, :release_type, :string
    add_column :release_notes, :name, :string

    execute <<~SQL.squish
      UPDATE release_notes
      SET release_type = 'software'
      WHERE release_type IS NULL
    SQL

    change_column_null :release_notes, :release_type, false
    add_index :release_notes, :release_type
    add_index :release_notes,
              :version,
              unique: true,
              where: "release_type = 'software'",
              name: "index_release_notes_on_version_for_software"

    begin
      if defined?(ReleaseNote) && ReleaseNote.respond_to?(:reindex)
        ReleaseNote.reindex
      end
    rescue StandardError => e
      say "Skipping ReleaseNote reindex: #{e.message}"
    end
  end

  def down
    remove_index :release_notes,
                 name: "index_release_notes_on_version_for_software",
                 if_exists: true
    remove_index :release_notes, :release_type, if_exists: true
    remove_column :release_notes, :name
    remove_column :release_notes, :release_type
  end
end
