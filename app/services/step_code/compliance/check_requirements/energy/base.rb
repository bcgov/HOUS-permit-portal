class StepCode::Compliance::CheckRequirements::Energy::Base
  KWH_PER_GJ = 227.78

  def initialize(checklist:, step:)
    @checklist = checklist
    @step = step
  end

  def total_heated_floor_area
    @total_heated_floor_area ||=
      total(:above_grade_heated_floor_area) +
        total(:below_grade_heated_floor_area)
  end

  private

  attr_reader :checklist, :step

  def stage
    @stage ||= checklist.stage == :as_built ? :as_built : :proposed
  end

  def total(field)
    checklist.data_entries.sum(field)
  end

  def tedi_reference
    @tedi_reference ||=
      ThermalEnergyDemandIntensityReference.find_by(
        "hdd @> :hdd AND step = :step",
        hdd: total(:hdd),
        step: step
      )
  end
end
