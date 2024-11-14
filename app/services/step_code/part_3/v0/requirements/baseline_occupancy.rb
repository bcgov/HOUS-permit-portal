class Part3::V0::Requirements::BaselineOccupancy
  attr_reader :occupancy, :climate_zone, :energy_step, :zero_carbon_step

  def initialize(occupancy:)
    @occupancy = occupancy
  end

  def call
    {
      occupancy: occupancy.key,
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
