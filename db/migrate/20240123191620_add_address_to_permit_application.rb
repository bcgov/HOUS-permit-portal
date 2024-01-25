class AddAddressToPermitApplication < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :full_address, :string
    add_column :permit_applications, :pid, :string
    add_column :permit_applications, :pin, :string
  end
end
