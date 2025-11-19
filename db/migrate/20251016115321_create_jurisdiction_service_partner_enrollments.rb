class CreateJurisdictionServicePartnerEnrollments < ActiveRecord::Migration[7.1]
  def change
    create_table :jurisdiction_service_partner_enrollments, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.integer :service_partner, null: false
      t.boolean :enabled, default: true, null: false

      t.timestamps
    end

    add_index :jurisdiction_service_partner_enrollments,
              %i[jurisdiction_id service_partner],
              unique: true,
              name: "index_jurisdiction_service_partner_unique"
  end
end
