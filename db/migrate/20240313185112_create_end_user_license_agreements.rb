class CreateEndUserLicenseAgreements < ActiveRecord::Migration[7.1]
  def change
    create_table :end_user_license_agreements, id: :uuid do |t|
      t.text :content
      t.boolean :active

      t.timestamps
    end
  end
end
