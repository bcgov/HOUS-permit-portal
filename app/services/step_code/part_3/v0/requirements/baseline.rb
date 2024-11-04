class StepCode::Part3::V0::Requirements::Baseline
  attr_reader :checklist, :occupancies

  def initialize(checklist:)
    @checklist = checklist
    @occupancies = checklist.occupancy_classifications.baseline_occupancy
  end

  def call
    return {} if occupancies.empty?

    {
      teui: teui,
      tedi: tedi,
      ghgi: ghgi,
      total_energy: total_energy,
      modelled_floor_area: total_mfa
    }
  end

  private

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
    reference_energy_outputs.inject do |sum, output|
      sum + output.annual_energy * output.fuel_type.emissions_factor
    end / total_mfa
  end

  def total_energy
    @total_energy ||= reference_energy_outputs.sum(:annual_energy)
  end

  def reference_energy_outputs
    @reference_energy_outputs ||= checklist.reference_energy_outputs
  end

  def total_mfa
    @total_mfa ||= occupancies.sum(:modelled_floor_area)
  end
end
