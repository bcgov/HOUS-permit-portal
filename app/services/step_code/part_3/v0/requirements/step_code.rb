class StepCode::Part3::V0::Requirements::StepCode
  attr_reader :checklist, :occupancies

  def initialize(checklist:)
    @checklist = checklist
    @occupancies = checklist.occupancy_classifications.step_code_occupancy
  end

  def call
    {
      occupancies_requirements: occupancies_requirements,
      area_weighted_totals: area_weighted_totals
    }
  end

  private

  def occupancies_requirements
    @occupancies_requirements ||=
      occupancies.map do |oc|
        StepCode::Part3::V0::Requirements::StepCodeOccupancy.new(
          occupancy: oc,
          climate_zone: checklist.climate_zone&.to_sym
        ).call
      end
  end

  def area_weighted_totals
    {
      teui: area_weighted_total(:teui),
      tedi: area_weighted_total(:tedi),
      ghgi: area_weighted_total(:ghgi),
      modelled_floor_area: total_mfa
    }
  end

  def area_weighted_total(metric)
    return if measure_only?(metric) || total_mfa == 0

    occupancies_requirements.inject(0) do |sum, requirement|
      # binding.pry
      sum + requirement[:modelled_floor_area] * requirement[metric]
    end / total_mfa
  rescue StandardError => e
    # binding.pry
    nil
  end

  def measure_only?(metric)
    return false unless metric == :ghgi

    occupancies_requirements.any? do |r|
      r[:ghgi].nil? || r[:ghgi] == "Measure Only"
    end
  end

  def total_mfa
    @total_mfa ||=
      checklist.occupancy_classifications.step_code_occupancy.sum(
        :modelled_floor_area
      )
  end
end
