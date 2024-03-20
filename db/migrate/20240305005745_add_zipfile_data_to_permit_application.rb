class AddZipfileDataToPermitApplication < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :zipfile_data, :jsonb
  end
end
