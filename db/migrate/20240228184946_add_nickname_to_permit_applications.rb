class AddNicknameToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :nickname, :string
  end
end
