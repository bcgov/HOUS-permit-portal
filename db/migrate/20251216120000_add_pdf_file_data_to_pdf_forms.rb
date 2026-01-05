class AddPdfFileDataToPdfForms < ActiveRecord::Migration[7.1]
  def change
    # [OVERHEATING AUDIT] Please consolidate this with the other migration.
    add_column :pdf_forms, :pdf_file_data, :jsonb
  end
end
