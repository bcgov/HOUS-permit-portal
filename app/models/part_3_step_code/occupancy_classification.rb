class Part3StepCode::OccupancyClassification < ApplicationRecord
  self.table_name = "occupancy_classifications"

  belongs_to :checklist

  OCCUPANCIES_LOOKUP = Constants::Part3StepCode::OCCUPANCIES_LOOKUP

  enum key: OCCUPANCIES_LOOKUP.keys, _prefix: :occupancy
  enum performance_requirement: %i[
         step_2_necb
         ashrae
         %_better_ashrae
         necb
         %_better_necb
       ]
  enum occupancy_type: %i[baseline step_code], _suffix: :occupancy

  validates :key, presence: true, uniqueness: { scope: :checklist_id }

  def energy_step_required
    return unless step_code_occupancy?

    self[:energy_step_required].presence || ENV["PART_3_MIN_ENERGY_STEP"].to_i
  end

  # def zero_carbon_step_required
  #   return unless step_code_occupancy?

  #   self[:zero_carbon_step_required].presence || ENV["PART_3_MIN_ZERO_CARBON_STEP"].to_i
  # end
end
