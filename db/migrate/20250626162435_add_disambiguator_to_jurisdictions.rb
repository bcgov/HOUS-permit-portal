class AddDisambiguatorToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :disambiguator, :string
  end
end
