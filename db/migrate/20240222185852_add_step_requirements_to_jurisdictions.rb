class AddStepRequirementsToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdictions, :energy_step_required, :integer
    add_column :jurisdictions, :zero_carbon_step_required, :integer
  end
end
