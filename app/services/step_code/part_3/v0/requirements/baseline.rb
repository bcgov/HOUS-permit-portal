class StepCode::Part3::V0::Requirements::Baseline
  attr_reader :checklist, :occupancies

  def initialize(checklist:)
    @checklist = checklist
    @occupancies = checklist.occupancy_classifications.baseline_occupancy
  end

  def call
    if checklist.occupancy_classifications.baseline_occupancy.empty?
      { teiu: 0, tedi: 0, ghgi: 0, modelled_floor_area: 0, total_energy: 0 }
    elsif checklist.occupancy_classifications.step_code_occupancy.empty?
      {
        teiu: 0,
        tedi: 0,
        ghgi: 0,
        total_energy: total_annual_energy,
        modelled_floor_area: total_mfa
      }
    else
      {
        teui: teui,
        tedi: tedi,
        ghgi: ghgi,
        total_energy: 0,
        modelled_floor_area: total_mfa
      }
    end
  end

  private

  def total_annual_energy
    @total_annual_energy ||=
      checklist.reference_energy_outputs.sum(:annual_energy)
  end

  def teui
    adjustment_factor =
      occupancies.inject do |sum, oc|
        sum + oc.modelled_floor_area * oc.percent_better_requirement
      end
    total_annual_energy / total_mfa * (1 - adjustment_factor / total_mfa)
  end

  def tedi
    total_annual_energy / total_mfa
  end

  def ghgi
    checklist.reference_energy_outputs.inject do |sum, output|
      sum + output.annual_energy * output.fuel_type.emissions_factor
    end / total_mfa
  end

  def total_mfa
    @total_mfa ||=
      checklist.occupancy_classifications.baseline_occupancy.sum(
        :modelled_floor_area
      ) || 0
  end
end
