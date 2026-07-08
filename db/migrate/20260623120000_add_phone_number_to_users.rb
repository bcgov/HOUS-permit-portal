class AddPhoneNumberToUsers < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:users, :phone_number)
      add_column :users, :phone_number, :string
    end
  end
end
