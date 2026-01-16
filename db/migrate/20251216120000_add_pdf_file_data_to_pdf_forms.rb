class AddPdfFileDataToPdfForms < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:pdf_forms, :pdf_file_data)
      add_column :pdf_forms, :pdf_file_data, :jsonb
    end
  end

  def down
    if column_exists?(:pdf_forms, :pdf_file_data)
      remove_column :pdf_forms, :pdf_file_data
    end
  end
end
