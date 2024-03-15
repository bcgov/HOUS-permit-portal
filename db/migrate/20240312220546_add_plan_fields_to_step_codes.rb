class AddPlanFieldsToStepCodes < ActiveRecord::Migration[7.1]
  def change
    add_column :step_codes, :plan_author, :string
    add_column :step_codes, :plan_version, :string
    add_column :step_codes, :plan_date, :string
  end
end
