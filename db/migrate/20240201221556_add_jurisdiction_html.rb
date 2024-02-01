class AddJurisdictionHtml < ActiveRecord::Migration[7.1]
  def change
    # Rename columns
    rename_column :jurisdictions, :description, :description_html

    # Remove the jsonb fields
    remove_column :jurisdictions, :checklist_slate_data, :jsonb
    remove_column :jurisdictions, :look_out_slate_data, :jsonb

    # Add the new text fields
    add_column :jurisdictions, :checklist_html, :text
    add_column :jurisdictions, :look_out_html, :text
    add_column :jurisdictions, :contact_summary_html, :text
  end
end
