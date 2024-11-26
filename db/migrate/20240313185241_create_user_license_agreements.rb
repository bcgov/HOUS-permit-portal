class CreateUserLicenseAgreements < ActiveRecord::Migration[7.1]
  def change
    create_table :user_license_agreements, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :agreement,
                   null: false,
                   foreign_key: {
                     to_table: :end_user_license_agreements
                   },
                   type: :uuid
      t.date :accepted_at, null: false

      t.timestamps
    end
  end
end
