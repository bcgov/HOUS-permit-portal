class MakePermitClassificationsCodeEnum < ActiveRecord::Migration[7.1]
  def change
    rename_column :permit_classifications, :code, :code_string
    add_column :permit_classifications, :code, :integer

    PermitClassification.reset_column_information

    PermitClassification.find_each { |pc| pc.update(code: PermitClassification.codes[pc.code_string]) }

    remove_column :permit_classifications, :code_string
  end
end
