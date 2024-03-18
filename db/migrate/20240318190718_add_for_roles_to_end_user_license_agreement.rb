class AddForRolesToEndUserLicenseAgreement < ActiveRecord::Migration[7.1]
  def change
    add_column :end_user_license_agreements, :variant, :integer

    EulaUpdater.run
  end
end
