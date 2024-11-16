class AddDefaultStepsToJurisdictions < ActiveRecord::Migration[7.1]
  def change
    change_column :jurisdictions,
                  :energy_step_required,
                  :integer,
                  default: ENV["MIN_ENERGY_STEP"]
    change_column :jurisdictions,
                  :zero_carbon_step_required,
                  :integer,
                  default: ENV["MIN_ZERO_CARBON_STEP"]
  end

  def data
    Jurisdiction.update_all(
      energy_step_required: ENV["MIN_ENERGY_STEP"],
      zero_carbon_step_required: ENV["MIN_ZERO_CARBON_STEP"]
    )
  end
end
