class UpdateContacts < ActiveRecord::Migration[7.1]
  def change
    # Step 1: Rename and modify existing columns
    rename_column :contacts, :phone_number, :phone

    # Step 2: Add new columns
    add_column :contacts, :first_name, :string, null: false, default: ""
    add_column :contacts, :last_name, :string, null: false, default: ""
    add_column :contacts, :cell, :string, null: true
    add_column :contacts, :address, :text, null: true
    add_column :contacts, :business_name, :string, null: true
    add_column :contacts, :business_license, :string, null: true
    add_column :contacts, :professional_association, :string, null: true
    add_column :contacts, :professional_number, :string, null: true

    # Step 3: Polymorphic Association
    add_reference :contacts, :contactable, polymorphic: true, type: :uuid

    # After adding the columns, execute data migration for splitting 'name' into 'first_name' and 'last_name'
    reversible do |dir|
      dir.up do
        Contact.find_each do |contact|
          names = contact.name.split(" ")
          if names.length > 1
            contact.update(
              first_name: names[0] || "",
              last_name: names[1..].join(" ") || "",
              contactable_id: contact.jurisdiction_id,
              contactable_type: "Jurisdiction"
            )
          else
            contact.update(
              first_name: names[0] || "",
              last_name: "",
              contactable_id: contact.jurisdiction_id,
              contactable_type: "Jurisdiction"
            )
          end
        end
      end
    end

    # Make some fields nullable
    change_column_null :contacts, :title, true
    change_column_null :contacts, :organization, true

    # Finally, remove columns and constraints no longer needed
    remove_column :contacts, :name, :string
    remove_column :contacts, :jurisdiction_id, :uuid

    Contact.reset_column_information
  end
end
