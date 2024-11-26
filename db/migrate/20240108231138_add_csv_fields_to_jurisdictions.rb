class AddCsvFieldsToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :incorporation_date, :date
    add_column :jurisdictions, :postal_address, :string
    add_column :jurisdictions, :type, :string
    add_column :jurisdictions, :locality_type, :string
    add_reference :jurisdictions,
                  :regional_district,
                  type: :uuid,
                  foreign_key: {
                    to_table: :jurisdictions
                  },
                  null: true
  end
end
