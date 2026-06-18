# frozen_string_literal: true

class AddAboutPageExtendedFieldsToJurisdictions < ActiveRecord::Migration[7.2]
  def change
    change_table :jurisdictions, bulk: true do |t|
      t.text :processing_time_html
      t.text :key_stages_html
      t.text :timeline_and_deliverables_html
      t.text :office_hours
      t.text :office_address
      t.string :office_telephone
      t.string :office_email
      t.string :website_url
    end
  end
end
