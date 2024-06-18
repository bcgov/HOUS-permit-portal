class RemoveNickname < ActiveRecord::Migration[7.1]
  def change
    remove_column :users, :nickname, :string
  end
end
