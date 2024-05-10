class RenameOmniauthFields < ActiveRecord::Migration[7.1]
  def change
    rename_column :users, :bceid_user_guid, :omniauth_uid
    rename_column :users, :auth_provider, :omniauth_provider
    rename_column :users, :bceid_email, :omniauth_email
    rename_column :users, :bceid_username, :omniauth_username
  end
end
