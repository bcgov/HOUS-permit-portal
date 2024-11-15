class StepCode::Part3::V1::EvaluatePerformance
  attr_reader :checklist, :requirements

  def initialize(checklist:, requirements:)
    @checklist = checklist
    @requirements = requirements
  end

  def call
    {
      requirements: requirements,
      results_as_modelled: results_as_modelled,
      corridor_pressurization_adjustment: corridor_pressurization_adjustment,
      suite_sub_metering_adjustment: suite_sub_metering_adjustment,
      adjusted_results: adjusted_results,
      does_building_comply: does_building_comply
    }
  end

  private

  def results_as_modelled
    @results_as_modelled ||=
      StepCode::Part3::V1::Performance::ResultsAsModelled
        .new(checklist: checklist)
        .call
        .results
  end

  def corridor_pressurization_adjustment
    @corridor_pressurization_adjustment ||=
      StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment
        .new(checklist: checklist)
        .call
        .results
  end

  def suite_sub_metering_adjustment
    @suite_sub_metering_adjustment ||=
      StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment
        .new(checklist: checklist)
        .call
        .results
  end

  def adjusted_results
    StepCode::Part3::V1::Performance::AdjustedResults
      .new(
        checklist: checklist,
        results_as_modelled: results_as_modelled,
        corridor_pressurization_adjustment: corridor_pressurization_adjustment,
        suite_sub_metering_adjustment: suite_sub_metering_adjustment
      )
      .call
      .results
  end

  def does_building_comply
    #take in corridor etc.
    { teiu: false, tedi: false, ghgi: false }
  end
end
