class CreatePreChecks < ActiveRecord::Migration[7.1]
  def up
    create_table :pre_checks,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.uuid :permit_application_id
      t.uuid :permit_type_id
      t.uuid :creator_id, null: false
      t.uuid :jurisdiction_id
      t.string :certificate_no
      t.string :full_address
      t.integer :service_partner, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.integer :assessment_result, null: true, default: nil

      # Archistar response data
      t.datetime :submitted_at # When submitted to Archistar
      t.datetime :completed_at # When Archistar completed processing
      t.datetime :viewed_at # When user viewed the completed results
      t.text :result_message # Message from Archistar (e.g., "All sections have passed.")

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
    add_index :pre_checks, :certificate_no, unique: true
    add_index :pre_checks, :assessment_result
    add_index :pre_checks, :completed_at
    add_index :pre_checks, :viewed_at

    add_foreign_key :pre_checks,
                    :permit_applications,
                    column: :permit_application_id
    add_foreign_key :pre_checks,
                    :permit_classifications,
                    column: :permit_type_id
    add_foreign_key :pre_checks, :users, column: :creator_id
    add_foreign_key :pre_checks, :jurisdictions, column: :jurisdiction_id
  end

  def down
    drop_table :pre_checks
  end
end
