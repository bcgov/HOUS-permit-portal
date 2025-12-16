class AddPdfFileDataToPdfForms < ActiveRecord::Migration[7.1]
  def change
    add_column :pdf_forms, :pdf_file_data, :jsonb
    add_index :pdf_forms, :pdf_file_data, using: :gin
  end
end
