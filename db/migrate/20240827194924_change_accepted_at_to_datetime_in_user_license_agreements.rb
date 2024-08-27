class ChangeAcceptedAtToDatetimeInUserLicenseAgreements < ActiveRecord::Migration[7.1]
  def change
    change_column :user_license_agreements, :accepted_at, :datetime
  end
end
