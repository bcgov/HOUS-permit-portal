# frozen_string_literal: true

class UpdateShowAboutPage < ActiveRecord::Migration[7.1]
  def up
    execute "UPDATE jurisdictions SET show_about_page = true WHERE description_html IS NOT NULL;"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
