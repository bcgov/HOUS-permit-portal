class AddShowAboutPageToJurisdictions < ActiveRecord::Migration[7.0]
  def up
    unless column_exists?(:jurisdictions, :show_about_page)
      add_column :jurisdictions,
                 :show_about_page,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:jurisdictions, :show_about_page)
      remove_column :jurisdictions, :show_about_page
    end
  end
end
