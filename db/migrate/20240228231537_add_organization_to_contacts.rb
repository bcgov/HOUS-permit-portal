class AddOrganizationToContacts < ActiveRecord::Migration[7.1]
  def change
    add_column :contacts, :organization, :string
    add_column :contacts, :cell_number, :string
  end
end
