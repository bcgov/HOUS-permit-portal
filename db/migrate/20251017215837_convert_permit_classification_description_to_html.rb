class ConvertPermitClassificationDescriptionToHtml < ActiveRecord::Migration[
  7.1
]
  def up
    rename_column :permit_classifications, :description, :description_html
    change_column :permit_classifications, :description_html, :text
  end

  def down
    change_column :permit_classifications, :description_html, :string
    rename_column :permit_classifications, :description_html, :description
  end
end
