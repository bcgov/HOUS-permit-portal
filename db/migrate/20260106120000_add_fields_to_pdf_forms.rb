class AddFieldsToPdfForms < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:pdf_forms, :project_number)
      add_column :pdf_forms, :project_number, :string
    end
    unless column_exists?(:pdf_forms, :model)
      add_column :pdf_forms, :model, :string
    end
    unless column_exists?(:pdf_forms, :site)
      add_column :pdf_forms, :site, :string
    end
    add_column :pdf_forms, :lot, :string unless column_exists?(:pdf_forms, :lot)
    unless column_exists?(:pdf_forms, :address)
      add_column :pdf_forms, :address, :string
    end
  end

  def down
    if column_exists?(:pdf_forms, :project_number)
      remove_column :pdf_forms, :project_number
    end
    remove_column :pdf_forms, :model if column_exists?(:pdf_forms, :model)
    remove_column :pdf_forms, :site if column_exists?(:pdf_forms, :site)
    remove_column :pdf_forms, :lot if column_exists?(:pdf_forms, :lot)
    remove_column :pdf_forms, :address if column_exists?(:pdf_forms, :address)
  end
end
