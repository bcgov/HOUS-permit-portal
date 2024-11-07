class StepCode::Part3::V1::Performance::ResultsAsModelled
  attr_reader :checklist, :requirements

  def initialize(checklist:, requirements:)
    @checklist = checklist
    @requirements = requirements
  end

  def call
    { teui: teui, tedi: tedi, ghgi: ghgi, total_energy: total_energy }
  end

  private

  def total_energy
    return unless applicable?(:total_energy)

    total_energy_use
  end

  def teui
    return unless applicable?(:teui)

    total_energy_use / total_mfa
  end

  def tedi
    return unless applicable?(:tedi)

    checklist.total_annual_thermal_energy_demand / total_mfa
  end

  def ghgi
    return unless applicable?(:ghgi)

    total_emissions / total_mfa
  end

  def total_emissions
    @total_emissions ||=
      checklist
        .modelled_energy_outputs
        .joins(:fuel_type)
        .sum("annual_energy * fuel_types.emissions_factor")
  end

  def applicable?(metric)
    compliance_metrics.include?(metric)
  end

  def compliance_metrics
    @compliance_metrics ||= checklist.compliance_metrics
  end

  def total_energy_use
    @total_energy_use ||=
      requirements[:total_enetry] - checklist.generated_electricity
  end

  def total_mfa
    @total_mfa ||= checklist.occupancies.sum(:modelled_floor_area)
  end
end
