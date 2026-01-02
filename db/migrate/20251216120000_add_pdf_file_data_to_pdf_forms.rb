class AddPdfFileDataToPdfForms < ActiveRecord::Migration[7.1]
  def change
    add_column :pdf_forms, :pdf_file_data, :jsonb
  end
end
