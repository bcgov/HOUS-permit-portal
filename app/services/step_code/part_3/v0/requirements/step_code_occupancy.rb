class StepCode::Part3::V0::Requirements::StepCodeOccupancy
  attr_reader :occupancy, :climate_zone, :energy_step, :zero_carbon_step

  def initialize(occupancy:, climate_zone:, energy_step:, zero_carbon_step:)
    @occupancy = occupancy
    @climate_zone = climate_zone
    @energy_step = energy_step
    @zero_carbon_step = zero_carbon_step
  end

  def call
    {
      occupancy: occupancy.key,
      modelled_floor_area: occupancy.modelled_floor_area,
      **step_code_requirements,
      **zero_carbon_requirements
    }
  end

  private

  def major_occupancy_type
    @major_occupancy_type ||=
      Constants::Part3StepCode::OCCUPANCIES_LOOKUP.dig(
        occupancy.key.to_sym,
        :major_occupancy_type
      )
  end

  def step_code_requirements
    StepCode::Part3::V0::Requirements::References::Energy.value(
      major_occupancy_type,
      climate_zone,
      checklist.energy_step_required
    )
  end

  def zero_carbon_requirement
    StepCode::Part3::V0::Requirements::References::ZeroCarbon.value(
      major_occupancy_type,
      checklist.zero_carbon_step_required
    )
  end
end
