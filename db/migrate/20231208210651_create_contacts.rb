class CreateContacts < ActiveRecord::Migration[7.1]
  def change
    create_table :contacts, id: :uuid do |t|
      t.string :name
      t.string :title
      t.string :first_nation
      t.string :email
      t.string :phone_number
      t.references :local_jurisdiction, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end
end
