require "rails_helper"

PART_3_PASSING_COMPLIANCE_RESULTS = "a compliant part 3 building that"

RSpec.shared_examples PART_3_PASSING_COMPLIANCE_RESULTS do
  it "returns the expected results for each occupancy classification" do
    expect(subject.results.dig(:occupancies)).to eq(expected_occupancies)
  end

  it "passes the compliance check" do
    expect(subject.results.dig(:performance, :compliance_summary)).to eq(
      expected_compliance_results
    )
  end

  it "returns the correct requirements metrics" do
    expect(subject.results.dig(:performance, :requirements)).to eq(
      expected_requirements_metrics
    )
  end

  it "returns the correct modelled metrics" do
    expect(subject.results.dig(:performance, :results_as_modelled)).to eq(
      expected_modelled_metrics
    )
  end

  it "returns the correct corridor pressurization adjustment" do
    expect(
      subject.results.dig(:performance, :corridor_pressurization_adjustment)
    ).to eq(expected_corridor_pressurization_adjustment_metrics)
  end

  it "returns the correct suite submetering adjustment" do
    expect(
      subject.results.dig(:performance, :suite_sub_metering_adjustment)
    ).to eq(expected_suite_sub_metering_adjustment_metrics)
  end

  it "returns the correct adjusted performance compliance" do
    expect(subject.results.dig(:performance, :adjusted_results)).to eq(
      expected_adjusted_performance_metrics
    )
  end
end
