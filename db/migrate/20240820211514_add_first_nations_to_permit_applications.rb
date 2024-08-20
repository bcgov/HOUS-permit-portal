class AddFirstNationsToPermitApplications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_applications, :first_nations, :boolean, default: false
  end
end
