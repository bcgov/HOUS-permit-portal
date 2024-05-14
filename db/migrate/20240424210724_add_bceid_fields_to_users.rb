class AddBceidFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :bceid_email, :string
    add_column :users, :bceid_username, :string
    rename_column :users, :uid, :bceid_user_guid
    rename_column :users, :provider, :auth_provider
    rename_column :users, :username, :nickname
    change_column_null :users, :email, true

    # Remove unique constraint on email index
    remove_index :users, :email
    add_index :users, :email
  end
end
