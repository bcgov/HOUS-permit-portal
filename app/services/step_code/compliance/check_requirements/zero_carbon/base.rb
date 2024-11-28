# GHG: Greenhouse Gas
# EF: Emission Factor

class StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  ELECTRICITY_EF = 0.011
  NATURAL_GAS_EF = 0.18
  PROPANE_EF = 0.2155

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
