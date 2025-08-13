class AddStandaloneFieldsToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_reference :step_codes, :jurisdiction, type: :uuid, foreign_key: true
    add_column :step_codes, :reference_number, :string
    add_column :step_codes, :project_name, :string
    add_column :step_codes, :permit_date, :date
    add_column :step_codes, :project_stage, :string
    add_column :step_codes, :building_code_version, :string
  end
end
