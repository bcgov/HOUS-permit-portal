class CreateReleaseNotes < ActiveRecord::Migration[7.2]
  def change
    create_table :release_notes, id: :uuid do |t|
      t.string :version
      t.datetime :release_date
      t.text :content
      t.string :release_notes_url
      t.text :issues
      t.integer :status, null: false, default: 0

      t.timestamps

      t.index :release_date
      t.index :status
      t.index :updated_at
    end
  end
end
