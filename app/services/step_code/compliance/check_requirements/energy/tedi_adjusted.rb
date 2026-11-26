# frozen_string_literal: true

# Rev. 7 Sentence 9.36.6.3.(4) — TEDIadjusted from actual HDD + heated floor area.
# Zone 8 (≥7000) keeps the pre–Rev.7 TEDIlower extrapolation slope + Small Home.
class StepCode::Compliance::CheckRequirements::Energy::TEDIAdjusted
  SMALL_HOME_AREA_M2 = 210
  SMALL_HOME_ADJ = 0.004

  # probe / next_probe / prev_probe: representative HDD points inside seeded ranges
  BANDS = [
    {
      max_hdd: 2999,
      # Rev. 7 References R11: (TEDIstep+(TEDIhigher-TEDIstep)*(HDD-2500)/500)
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

  # Rev. 7: IF(area>=210, 0, 0.004*(HDD-3000)) — 210 m² is not Small Home.
  def small_home_adj
    @heated_floor_area < SMALL_HOME_AREA_M2 ? SMALL_HOME_ADJ : 0
  end
end
