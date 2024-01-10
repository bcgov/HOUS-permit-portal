class CreatePermitClassifications < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_classifications, id: :uuid do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.string :type, null: false

      t.timestamps
    end

    add_index :permit_classifications, :code, unique: true
  end
end
