class UpdateContacts < ActiveRecord::Migration[7.1]
  def change
    # Step 1: Rename and modify existing columns
    rename_column :contacts, :phone_number, :phone
    # The extension, jurisdiction_id, and other fields not needed can be removed later

    # Step 2: Add new columns
    add_column :contacts, :first_name, :string, null: false, default: ""
    add_column :contacts, :last_name, :string, null: false, default: ""
    add_column :contacts, :cell, :string, null: true
    add_column :contacts, :address, :text, null: true
    add_column :contacts, :business_name, :string, null: true
    add_column :contacts, :business_license, :string, null: true
    add_column :contacts, :professional_association, :string, null: true
    add_column :contacts, :professional_number, :string, null: true
    # Note: user_id can be added if it doesn't exist, or it's handled as part of the polymorphic setup

    # Step 3: Polymorphic Association
    add_reference :contacts, :contactable, polymorphic: true, type: :uuid

    # After adding the columns, execute data migration for splitting 'name' into 'first_name' and 'last_name'
    reversible do |dir|
      dir.up do
        Contact.find_each do |contact|
          names = contact.name.split(" ")
          # Set last_name to the last element of the split name
          last_name = names.pop
          # Set first_name to all elements except the last, joined by a space
          first_name = names.join(" ")

          contact.update(first_name: first_name, last_name: last_name || "")
        end
      end
    end

    # Make some fields nullable
    change_column_null :contacts, :title, true
    change_column_null :contacts, :organization, true

    # Finally, remove columns and constraints no longer needed
    remove_column :contacts, :name
    remove_column :contacts, :jurisdiction_id # Make sure to handle foreign key constraints appropriately
  end
end
