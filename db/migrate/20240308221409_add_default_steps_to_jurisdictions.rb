class AddDefaultStepsToJurisdictions < ActiveRecord::Migration[7.1]
  def up
    change_column_default :jurisdictions,
                          :energy_step_required,
                          from: nil,
                          to: ENV["PART_9_MIN_ENERGY_STEP"]&.to_i
    change_column_default :jurisdictions,
                          :zero_carbon_step_required,
                          from: nil,
                          to: ENV["PART_9_MIN_ZERO_CARBON_STEP"]&.to_i
  end

  def down
    change_column_default :jurisdictions,
                          :energy_step_required,
                          from: ENV["PART_9_MIN_ENERGY_STEP"]&.to_i,
                          to: nil
    change_column_default :jurisdictions,
                          :zero_carbon_step_required,
                          from: ENV["PART_9_MIN_ZERO_CARBON_STEP"]&.to_i,
                          to: nil
  end

  def data
    Jurisdiction.update_all(
      energy_step_required: ENV["PART_9_MIN_ENERGY_STEP"],
      zero_carbon_step_required: ENV["PART_9_MIN_ZERO_CARBON_STEP"]
    )
  end
end
