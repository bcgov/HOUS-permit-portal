class RemoveStatusFromPdfForms < ActiveRecord::Migration[7.2]
  def change
    if column_exists?(:pdf_forms, :status)
      remove_column :pdf_forms, :status, :boolean
    end
  end
end
