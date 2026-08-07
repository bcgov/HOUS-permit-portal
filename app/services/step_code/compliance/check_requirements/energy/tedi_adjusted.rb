# frozen_string_literal: true

# Rev. 7 (not yet published/enacted) — TEDIadjusted from actual HDD + heated floor area.
# Piece together from emails + "Smaller homes in colder climates" public-review DOCX.
# The August 2025 checklist XLSX reflects current in-force logic and is not the
# source of truth for these amendments yet.
#
# - Zone 4 (<3000): (HDD − 2500) / 500; no small-home adder (MEUI has Zone 4
#   size relaxations; TEDI does not).
# - Zones 5–7B (3000–6999): /1000 + small-home when heated floor area ≤ 210 m².
# - Zone 8 (≥7000): freeze at Zone 8 table TEDIstep (+ small-home if ≤ 210);
#   do not extrapolate past the last table row (checklist does; we do not).
# - Exactly 210 m²: small-home adder applies (DOCX: adj is 0 only when > 210).
class StepCode::Compliance::CheckRequirements::Energy::TEDIAdjusted
  SMALL_HOME_AREA_M2 = 210
  SMALL_HOME_ADJ = 0.004

  # probe / next_probe: representative HDD points inside seeded ranges
  BANDS = [
    {
      max_hdd: 2999,
      hdd_lowest: 2500,
      probe: 0,
      next_probe: 3500,
      divisor: 500,
      small_home: false
    },
    {
      max_hdd: 3999,
      hdd_lowest: 3000,
      probe: 3500,
      next_probe: 4500,
      divisor: 1000,
      small_home: true
    },
    {
      max_hdd: 4999,
      hdd_lowest: 4000,
      probe: 4500,
      next_probe: 5500,
      divisor: 1000,
      small_home: true
    },
    {
      max_hdd: 5999,
      hdd_lowest: 5000,
      probe: 5500,
      next_probe: 6500,
      divisor: 1000,
      small_home: true
    },
    {
      max_hdd: 6999,
      hdd_lowest: 6000,
      probe: 6500,
      next_probe: 8000,
      divisor: 1000,
      small_home: true
    },
    { max_hdd: Float::INFINITY, probe: 8000, small_home: true, freeze: true }
  ].freeze

  def self.call(hdd:, step:, heated_floor_area:)
    new(hdd:, step:, heated_floor_area:).call
  end

  def initialize(hdd:, step:, heated_floor_area:)
    @hdd = hdd.to_f
    @step = step
    @heated_floor_area = heated_floor_area.to_f
  end

  def call
    band = band_for(@hdd)
    tedi_step = reference_tedi(band.fetch(:probe))
    climate = climate_adj(band, tedi_step)
    small_home = (band[:small_home] ? small_home_adj * (@hdd - 3000) : 0)

    tedi_step + climate + small_home
  end

  private

  def band_for(hdd)
    BANDS.find { |band| hdd <= band.fetch(:max_hdd) } ||
      raise(ArgumentError, "No TEDI climate band for HDD=#{hdd}")
  end

  def climate_adj(band, tedi_step)
    return 0 if band[:freeze]

    tedi_higher = reference_tedi(band.fetch(:next_probe))
    (tedi_higher - tedi_step) * (@hdd - band.fetch(:hdd_lowest)) /
      band.fetch(:divisor)
  end

  def reference_tedi(probe_hdd)
    ThermalEnergyDemandIntensityReference
      .find_by!(
        "hdd @> (:hdd)::int AND step = :step",
        hdd: probe_hdd,
        step: @step
      )
      .tedi
      .to_f
  end

  def small_home_adj
    @heated_floor_area <= SMALL_HOME_AREA_M2 ? SMALL_HOME_ADJ : 0
  end
end
