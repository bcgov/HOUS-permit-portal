class CreatePermitTypeSubmissionContacts < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_type_submission_contacts, id: :uuid do |t|
      t.references :jurisdiction, foreign_key: :true, type: :uuid
      t.references :permit_type,
                   foreign_key: {
                     to_table: :permit_classifications
                   },
                   type: :uuid

      # confirmable fields
      t.string :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at

      t.string :email, null: false
    end

    remove_column :jurisdictions, :submission_email, :string
  end
end
