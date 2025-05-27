class AddShowAboutPageToJurisdictions < ActiveRecord::Migration[7.1]
  def up
    add_column :jurisdictions,
               :show_about_page,
               :boolean,
               default: false,
               null: false
  end

  def down
    remove_column :jurisdictions, :show_about_page
  end
end
