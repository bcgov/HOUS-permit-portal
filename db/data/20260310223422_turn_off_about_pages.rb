# frozen_string_literal: true

class TurnOffAboutPages < ActiveRecord::Migration[7.2]
  def up
    Jurisdiction.where(description_html: nil).update_all(show_about_page: false)
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
