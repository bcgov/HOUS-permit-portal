class StepCode::Compliance::CheckRequirements::Energy::Base
  # 1 GJ = 277.78 kWh (MEUI/TEDI reported in kWh/m²·year; Hot2000 totals in GJ).
  KWH_PER_GJ = 277.78

  def initialize(checklist:, step:)
    @checklist = checklist
    @step = step
  end

  def total_heated_floor_area
    @total_heated_floor_area ||=
      total(:above_grade_heated_floor_area) +
        total(:below_grade_heated_floor_area)
  end

  # HUB-5472-follow-up (SME): The August 2025 checklist lets users enter HDD for
  # target lookups and separately shows modeled HDD from HOT2000. We currently
  # use only modeled HDD (highest across suite/model files). Should submitters
  # be able to override with a user-entered HDD, and if so which value wins?
  def hdd
    @hdd ||= checklist.data_entries.maximum(:hdd)
  end

  private

  attr_reader :checklist, :step

  def stage
    @stage ||= checklist.stage == :as_built ? :as_built : :proposed
  end

  def total(field)
    checklist.data_entries.sum(field)
  end

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
