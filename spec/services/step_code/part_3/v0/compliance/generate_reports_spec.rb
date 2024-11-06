RSpec.describe StepCode::Part3::V0::GenerateReports do
  let(:checklist) do
    build(:part_3_checklist, occupancy_classifications: occupancies)
  end

  context "single use not yet implemented" do
    let(:occupancies) do
      [*build_list(:step_code_occupancy, 1, :other_residential)]
    end

    it "fails in predefined failure case" do
      step_code_report_generator =
        StepCode::Part3::V0::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        occupancies.map do |occupancy|
          {
            occupancy: occupancy.key,
            energy_requirement: occupancy.energy_step_required,
            zero_carbon_requirement: occupancy.zero_carbon_step_required,
            performance_requirement: occupancy.performance_requirement
          }
        end
      )
      expect(result[:whole_building_performance][:does_building_comply]).to eq(
        { teiu: false, tedi: false, ghgi: false }
      )
      expect(result[:step_code_summary]).to eq(
        { step_achieved: nil, zero_carbon_achieved: nil }
      )
    end

    it "fails on passing example" do
      step_code_report_generator =
        StepCode::Part3::V0::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        occupancies.map do |occupancy|
          {
            occupancy: occupancy.key,
            energy_requirement: occupancy.energy_step_required,
            zero_carbon_requirement: occupancy.zero_carbon_step_required,
            performance_requirement: occupancy.performance_requirement
          }
        end
      )
      expect(result[:whole_building_performance][:does_building_comply]).to eq(
        { teiu: false, tedi: false, ghgi: false }
      )
      expect(result[:step_code_summary]).to eq(
        { step_achieved: nil, zero_carbon_achieved: nil }
      )
    end
  end

  context "mixed use not yet implemented" do
    let(:occupancies) do
      [
        *build_list(:step_code_occupancy, 1, :other_residential),
        *build_list(:step_code_occupancy, 1, :low_industrial)
      ]
    end

    it "fails in predefined failure case" do
      step_code_report_generator =
        StepCode::Part3::V0::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        occupancies.map do |occupancy|
          {
            occupancy: occupancy.key,
            energy_requirement: occupancy.energy_step_required,
            zero_carbon_requirement: occupancy.zero_carbon_step_required,
            performance_requirement: occupancy.performance_requirement
          }
        end
      )
      expect(result[:whole_building_performance][:does_building_comply]).to eq(
        { teiu: false, tedi: false, ghgi: false }
      )
      expect(result[:step_code_summary]).to eq(
        { step_achieved: nil, zero_carbon_achieved: nil }
      )
    end

    it "fails on passing example" do
      step_code_report_generator =
        StepCode::Part3::V0::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        occupancies.map do |occupancy|
          {
            occupancy: occupancy.key,
            energy_requirement: occupancy.energy_step_required,
            zero_carbon_requirement: occupancy.zero_carbon_step_required,
            performance_requirement: occupancy.performance_requirement
          }
        end
      )
      expect(result[:whole_building_performance][:does_building_comply]).to eq(
        { teiu: false, tedi: false, ghgi: false }
      )
      expect(result[:step_code_summary]).to eq(
        { step_achieved: nil, zero_carbon_achieved: nil }
      )
    end
  end
end
