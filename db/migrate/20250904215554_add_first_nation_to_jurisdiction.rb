class AddFirstNationToJurisdiction < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :first_nation, :boolean, default: false
  end
end
