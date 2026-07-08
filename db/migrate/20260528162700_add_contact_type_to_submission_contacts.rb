class AddContactTypeToSubmissionContacts < ActiveRecord::Migration[7.2]
  def change
    add_column :submission_contacts,
               :type,
               :string,
               default: "ApplicationSubmissionContact",
               null: false

    remove_index :submission_contacts, column: %i[jurisdiction_id email]
    add_index :submission_contacts,
              %i[jurisdiction_id email type],
              unique: true,
              name: :idx_submission_contacts_on_jurisdiction_email_sti_type
  end
end
