class AddCategoryToPermitClassifications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_classifications, :category, :string
  end
end
