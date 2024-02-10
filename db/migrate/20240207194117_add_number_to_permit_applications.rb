class AddNumberToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :prefix, :string
    add_column :permit_applications, :number, :string

    add_index :jurisdictions, :prefix, unique: true
    add_index :permit_applications, :number, unique: true
  end
end
