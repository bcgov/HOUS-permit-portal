class AddSlugToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :slug, :string
    add_index :jurisdictions, :slug, unique: true
  end

  def data
    Jurisdiction.find_each(&:save)
  end
end
