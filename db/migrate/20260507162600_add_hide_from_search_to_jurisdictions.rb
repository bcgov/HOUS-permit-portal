class AddHideFromSearchToJurisdictions < ActiveRecord::Migration[7.2]
  def change
    add_column :jurisdictions,
               :hide_from_search,
               :boolean,
               default: false,
               null: false
  end
end
