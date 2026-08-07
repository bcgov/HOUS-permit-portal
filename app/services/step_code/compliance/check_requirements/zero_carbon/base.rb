# GHG: Greenhouse Gas
# EF: Emission Factor

class StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  # SME: Assume Hot2000 fuel consumption is GJ/year (Part 9 E/F UI + Excel checklist).
  # Checklist EFs: electricity/gas as kg CO₂e/kWh × KWH_PER_GJ → kg/GJ;
  # propane already kg CO₂e/GJ (59.87).
  KWH_PER_GJ = StepCode::Compliance::CheckRequirements::Energy::Base::KWH_PER_GJ
  ELECTRICITY_EF = 0.011 * KWH_PER_GJ
  NATURAL_GAS_EF = 0.18 * KWH_PER_GJ
  PROPANE_EF = 59.87

  attr_reader :checklist, :step

  def initialize(checklist:, step:)
    @checklist = checklist
    @step = step
  end

  def total_ghg
    @total_ghg ||=
      other_ghg + district_energy_ghg + propane_ghg + natural_gas_ghg +
        electricity_ghg
  end

  private

  def stage
    @stage ||= checklist.stage == :as_built ? :as_built : :proposed
  end

  def total(field)
    checklist.data_entries.sum(field)
  end

  def min(field)
    checklist.data_entries.minimum(field)
  end

  def total_heated_floor_area
    @total_heated_floor_area ||=
      total(:above_grade_heated_floor_area) +
        total(:below_grade_heated_floor_area)
  end

  def electricity_ghg
    total("electrical_consumption * #{ELECTRICITY_EF}")
  end

  def natural_gas_ghg
    total("natural_gas_consumption * #{NATURAL_GAS_EF}")
  end

  def propane_ghg
    total("propane_consumption * #{PROPANE_EF}")
  end

  # district energy and other GHG require user provided EF and consumption

  def district_energy_ghg
    total("district_energy_consumption * district_energy_ef")
  end

  def other_ghg
    total("other_ghg_consumption * other_ghg_ef")
  end
end
