class AddPdfGenerationStatusToPdfForms < ActiveRecord::Migration[7.2]
  def change
    add_column :pdf_forms,
               :pdf_generation_status,
               :integer,
               default: 0,
               null: false
  end
end
