class CreateLocalJurisdictions < ActiveRecord::Migration[7.1]
  def change
    create_table :local_jurisdictions, id: :uuid do |t|
      t.string :name
      t.text :description
      t.jsonb :checklist_slate_data
      t.jsonb :look_out_slate_data

      t.timestamps
    end

    add_reference :users, :local_jurisdiction, null: true, foreign_key: true, type: :uuid
  end
end
