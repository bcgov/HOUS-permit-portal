class CreatePreChecks < ActiveRecord::Migration[7.1]
  def change
    create_table :pre_checks,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.uuid :permit_application_id
      t.uuid :permit_type_id
      t.uuid :creator_id, null: false
      t.uuid :jurisdiction_id
      t.string :cert_number
      t.string :phase
      t.string :full_address
      t.integer :service_partner, null: false, default: 0

      # Agreements and consent
      t.boolean :eula_accepted, default: false, null: false
      t.boolean :consent_to_send_drawings, default: false, null: false
      t.boolean :consent_to_share_with_jurisdiction, default: false
      t.boolean :consent_to_research_contact, default: false

      t.timestamps
    end

    add_index :pre_checks, :permit_application_id, unique: true
    add_index :pre_checks, :permit_type_id
    add_index :pre_checks, :creator_id
    add_index :pre_checks, :jurisdiction_id
    add_index :pre_checks, :service_partner

    add_foreign_key :pre_checks,
                    :permit_applications,
                    column: :permit_application_id
    add_foreign_key :pre_checks,
                    :permit_classifications,
                    column: :permit_type_id
    add_foreign_key :pre_checks, :users, column: :creator_id
    add_foreign_key :pre_checks, :jurisdictions, column: :jurisdiction_id
  end
end
