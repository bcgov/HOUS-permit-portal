class AddBceidFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :bceid_email, :string
    add_column :users, :bceid_username, :string
    rename_column :users, :username, :nickname
  end
end
