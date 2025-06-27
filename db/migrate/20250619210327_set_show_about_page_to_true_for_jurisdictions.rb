class SetShowAboutPageToTrueForJurisdictions < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction.update_all(show_about_page: true)
  end

  def down
    Jurisdiction.update_all(show_about_page: false)
  end
end
