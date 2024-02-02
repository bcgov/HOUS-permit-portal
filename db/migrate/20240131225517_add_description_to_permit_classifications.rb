class AddDescriptionToPermitClassifications < ActiveRecord::Migration[7.1]
  def change
    add_column :permit_classifications, :description, :string
    add_column :permit_classifications, :enabled, :boolean
  end
end
