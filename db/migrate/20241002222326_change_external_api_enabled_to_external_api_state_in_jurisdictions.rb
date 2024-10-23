class ChangeExternalApiEnabledToExternalApiStateInJurisdictions < ActiveRecord::Migration[
  7.1
]
  def up
    # Add the new column with a default value
    add_column :jurisdictions,
               :external_api_state,
               :string,
               default: "g_off",
               null: false

    # Migrate existing data
    Jurisdiction.reset_column_information
    Jurisdiction.find_each do |jurisdiction|
      if jurisdiction.external_api_enabled
        jurisdiction.update_columns(external_api_state: "j_on")
      else
        jurisdiction.update_columns(external_api_state: "g_off")
      end
    end

    # Remove the old boolean column
    remove_column :jurisdictions, :external_api_enabled, :boolean
  end

  def down
    # Re-add the old boolean column
    add_column :jurisdictions,
               :external_api_enabled,
               :boolean,
               default: false,
               null: false

    # Migrate data back
    Jurisdiction.reset_column_information
    Jurisdiction.find_each do |jurisdiction|
      jurisdiction.update_columns(
        external_api_enabled: (jurisdiction.external_api_state == "j_on")
      )
    end

    # Remove the enum column
    remove_column :jurisdictions, :external_api_state, :string
  end
end
