class RemoveFieldsFromPdfForms < ActiveRecord::Migration[7.2]
  def change
    if column_exists?(:pdf_forms, :project_number)
      remove_column :pdf_forms, :project_number, :string
    end
    if column_exists?(:pdf_forms, :model)
      remove_column :pdf_forms, :model, :string
    end
    if column_exists?(:pdf_forms, :site)
      remove_column :pdf_forms, :site, :string
    end
    remove_column :pdf_forms, :lot, :string if column_exists?(:pdf_forms, :lot)
    if column_exists?(:pdf_forms, :address)
      remove_column :pdf_forms, :address, :string
    end
  end
end
