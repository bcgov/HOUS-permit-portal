class AddReferenceNumberToPermitApplication < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :reference_number, :string, null: true
  end
end
