class CreatePermitProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_projects, id: :uuid do |t|
      t.references :owner,
                   null: false,
                   foreign_key: {
                     to_table: :users
                   },
                   type: :uuid
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.string :title
      t.text :full_address
      t.string :pid
      t.string :pin
      t.text :notes
      t.date :permit_date
      t.integer :phase
      t.datetime :discarded_at

      t.timestamps
    end
  end
end
