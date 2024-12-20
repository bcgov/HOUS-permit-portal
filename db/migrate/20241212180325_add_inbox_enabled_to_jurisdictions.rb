class AddInboxEnabledToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions,
               :inbox_enabled,
               :boolean,
               default: false,
               null: false
  end
end
