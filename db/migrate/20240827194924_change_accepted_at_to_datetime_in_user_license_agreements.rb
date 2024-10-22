class ChangeAcceptedAtToDatetimeInUserLicenseAgreements < ActiveRecord::Migration[
  7.1
]
  def up
    change_column :user_license_agreements, :accepted_at, :datetime
  end

  def down
    change_column :user_license_agreements, :accepted_at, :date
  end
end
