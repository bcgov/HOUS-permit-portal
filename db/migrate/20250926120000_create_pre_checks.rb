class CreatePreChecks < ActiveRecord::Migration[7.1]
  def change
    create_table :pre_checks,
                 id: :uuid,
                 default: -> { "gen_random_uuid()" } do |t|
      t.uuid :permit_application_id
      t.uuid :creator_id, null: false
      t.uuid :jurisdiction_id
      t.string :title
      t.string :cert_number
      t.date :permit_date
      t.string :phase
      t.string :full_address
      t.jsonb :checklist, null: false, default: {}

      t.timestamps
    end

    add_index :pre_checks, :permit_application_id, unique: true
    add_index :pre_checks, :creator_id
    add_index :pre_checks, :jurisdiction_id

    add_foreign_key :pre_checks,
                    :permit_applications,
                    column: :permit_application_id
    add_foreign_key :pre_checks, :users, column: :creator_id
    add_foreign_key :pre_checks, :jurisdictions, column: :jurisdiction_id
  end
end
