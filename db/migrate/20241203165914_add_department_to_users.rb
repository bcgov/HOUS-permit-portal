class AddDepartmentToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :department, :string
  end
end
