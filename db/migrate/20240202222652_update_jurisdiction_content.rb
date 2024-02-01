class UpdateJurisdictionContent < ActiveRecord::Migration[7.1]
  def change
    remove_column :contacts, :first_nation, :string
    add_column :contacts, :department, :string
    add_column :jurisdictions, :map_position, :jsonb
  end
end
