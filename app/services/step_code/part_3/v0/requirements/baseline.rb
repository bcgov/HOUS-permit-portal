class StepCode::Part3::V0::Requirements::Baseline
  attr_reader :checklist, :occupancies

  def initialize(checklist:)
    @checklist = checklist
    @occupancies = checklist.occupancy_classifications.baseline_occupancy
  end

  def call
    if checklist.occupancy_classifications.step_code_occupancy.empty?
      { total_energy: total_annual_energy, modelled_floor_area: total_mfa }
    else
      { teui: teui, tedi: tedi, ghgi: ghgi, modelled_floor_area: total_mfa }
    end
  end

  private

  def total_annual_energy
    @total_annual_energy ||=
      checklist.reference_energy_outputs.sum(:annual_energy)
  end

  def teui
    return nil if total_mfa.blank? || total_mfa == 0
    adjustment_factor =
      occupancies.inject do |sum, oc|
        sum + oc.modelled_floor_area * oc.percent_better_requirement
      end
    total_annual_energy / total_mfa * (1 - adjustment_factor / total_mfa)
  end

  def tedi
    return nil if total_mfa.blank? || total_mfa == 0
    total_annual_energy / total_mfa
  end

  def ghgi
    return nil if total_mfa.blank? || total_mfa == 0
    checklist.reference_energy_outputs.inject do |sum, output|
      sum + output.annual_energy * output.fuel_type.emissions_factor
    end / total_mfa
  end

  def total_mfa
    @total_mfa ||=
      checklist.occupancy_classifications.baseline_occupancy.sum(
        :modelled_floor_area
      )
  end
end
