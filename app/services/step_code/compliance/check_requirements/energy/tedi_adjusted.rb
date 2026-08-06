# frozen_string_literal: true

# Rev. 7 Sentence 9.36.6.3.(4) — TEDIadjusted from actual HDD + heated floor area.
#
# HUB-5472-follow-up (SME):
# - Which published BCBC amendment / effective date should this formula track?
#   We mirrored the August 2025 checklist References sheet (it still cites older
#   amendment text but already includes small-home / colder-climate terms).
# - Zone 4 (<3000 HDD): is the checklist right to use (HDD − 2500) / 500 with
#   no small-home adder? (At HDD 2500 the target equals the Zone 4 table value.)
# - Zone 8 (>6999 HDD): should we keep extrapolating past the last table row
#   using the 7B→8 slope + small-home (as the checklist does), or freeze at the
#   Zone 8 table value?
# - Small-home adder 0.004×(HDD−3000): confirm it applies only when heated floor
#   area is under 210 m² (exactly 210 m² gets no adder, matching the checklist).
class StepCode::Compliance::CheckRequirements::Energy::TEDIAdjusted
  SMALL_HOME_AREA_M2 = 210
  SMALL_HOME_ADJ = 0.004

  # probe / next_probe / prev_probe: representative HDD points inside seeded ranges
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
    {
      max_hdd: Float::INFINITY,
      hdd_lowest: 7000,
      probe: 8000,
      prev_probe: 6500,
      divisor: 1000,
      small_home: true,
      extrapolate: true
    }
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

    climate =
      if band[:extrapolate]
        tedi_lower = reference_tedi(band.fetch(:prev_probe))
        (tedi_step - tedi_lower) * (@hdd - band.fetch(:hdd_lowest)) /
          band.fetch(:divisor)
      else
        tedi_higher = reference_tedi(band.fetch(:next_probe))
        (tedi_higher - tedi_step) * (@hdd - band.fetch(:hdd_lowest)) /
          band.fetch(:divisor)
      end

    small_home = (band[:small_home] ? small_home_adj * (@hdd - 3000) : 0)

    tedi_step + climate + small_home
  end

  private

  def band_for(hdd)
    BANDS.find { |band| hdd <= band.fetch(:max_hdd) } ||
      raise(ArgumentError, "No TEDI climate band for HDD=#{hdd}")
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
    @heated_floor_area < SMALL_HOME_AREA_M2 ? SMALL_HOME_ADJ : 0
  end
end
