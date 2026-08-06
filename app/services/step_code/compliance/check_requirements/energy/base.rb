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

  # Climate / weather — same site across suite/models; never sum.
  def hdd
    @hdd ||= checklist.data_entries.maximum(:hdd)
  end

  private

  attr_reader :checklist, :step

  def stage
    @stage ||= checklist.stage == :as_built ? :as_built : :proposed
  end

  # Matches Excel Calculator "Proposed total": SUM for additive quantities.
  def total(field)
    checklist.data_entries.sum(field)
  end

  # Matches Excel Calculator "Proposed total": AVERAGE for rate metrics (ACH, NLA, …).
  def average(field)
    checklist.data_entries.average(field).to_f
  end

  def tedi_reference
    @tedi_reference ||=
      ThermalEnergyDemandIntensityReference.find_by(
        "hdd @> (:hdd)::int AND step = :step",
        hdd: hdd,
        step: step
      )
  end
end
