class AddShowAboutPageToJurisdictions < ActiveRecord::Migration[6.1]
  def up
    add_column :jurisdictions,
               :show_about_page,
               :boolean,
               default: true,
               null: false

    execute "UPDATE jurisdictions SET show_about_page = true;"
    SQL
  end

  def down
    remove_column :jurisdictions, :show_about_page
  end
end
