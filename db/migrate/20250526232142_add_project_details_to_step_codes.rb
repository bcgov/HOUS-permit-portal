class AddProjectDetailsToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_column :step_codes, :project_name, :string
    add_column :step_codes, :project_address, :string
    add_column :step_codes, :jurisdiction_name, :string # Storing the name, as jurisdiction_id might not always be relevant or available
    add_column :step_codes, :project_identifier, :string
    add_column :step_codes, :permit_date, :date
  end
end
