require "rails_helper"

PART_3_PASSING_COMPLIANCE_RESULTS = "a compliant part 3 building that"

RSpec.shared_examples PART_3_PASSING_COMPLIANCE_RESULTS do
  # it "returns the expected results for each occupancy classification" do
  #   expect(subject.results.dig(:occupancies)).to eq(expected_occupancies)
  # end

  # it "passes the compliance check" do
  #   expect(
  #     subject.results.dig(:whole_building_performance, :does_building_comply)
  #   ).to eq(expected_compliance_results)
  # end

  it "returns the correct requirements metrics" do
    expect(
      subject.results.dig(:whole_building_performance, :requirements)
    ).to eq(expected_requirements_metrics)
  end

  it "returns the correct modelled metrics" do
    expect(
      subject.results.dig(:whole_building_performance, :results_as_modelled)
    ).to eq(expected_modelled_metrics)
  end

  it "returns the correct corridor pressurization adjustment" do
    expect(
      subject.results.dig(
        :whole_building_performance,
        :corridor_pressurization_adjustment
      )
    ).to eq(expected_corridor_pressurization_adjustment_metrics)
  end

  it "returns the correct suite submetering adjustment" do
    expect(
      subject.results.dig(
        :whole_building_performance,
        :suite_sub_metering_adjustment
      )
    ).to eq(expected_suite_sub_metering_adjustment_metrics)
  end

  it "returns the correct adjusted performance compliance" do
    expect(
      subject.results.dig(:whole_building_performance, :adjusted_results)
    ).to eq(expected_adjusted_performance_metrics)
  end

  # it "returns the correct step code TEDI requirement" do
  #   expect(subject.results[:step_code_tedi_requirement]).to eq(
  #     expected_step_code_tedi_requirement
  #   )
  # end

  # it "return the correct step code TEDI modelled result" do
  #   expect(subject.results[:step_code_tedi_modelled_result]).to eq(
  #     expected_tedi_modelled_result
  #   )
  # end

  # it "returns the correct step code corridor adjustment" do
  #   expect(subject.results[:step_code_corridor_adjustment]).to eq(
  #     expected_step_code_corridor_adjustment
  #   )
  # end

  # it "returns the correct adjusted step code performance" do
  #   expect(subject.results[:adjusted_step_code_performance]).to eq(
  #     expected_adjusted_step_code_performance
  #   )
  # end

  # it "returns the correct step code TEDI compliance result" do
  #   expect(subject.results[:step_code_tedi_complies]).to eq(
  #     expected_step_code_complies
  #   )
  # end

  # it "returns the correct summary" do
  #   expect(subject.results[:summary]).to eq(expected_summary)
  # end
end
