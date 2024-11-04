RSpec.describe StepCode::Part3::V0::Compliance::GenerateReports do
  context "single use not yet implemented" do
    it "fails in predefined failure case" do
      step_code = {
        occupancies: [
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4",
            modelled_floor_area: 1000
          }
        ]
      }
      step_code_report_generator =
        StepCode::Part3::V0::Compliance::GenerateReports.new(step_code)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        [
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4"
          }
        ]
      )
      expect(result[:whole_building_performance][:does_building_comply]).to eq(
        { teiu: false, tedi: false, ghgi: false }
      )
      expect(result[:step_code_summary]).to eq(
        { step_achieved: nil, zero_carbon_achieved: nil }
      )
    end

    it "fails on passing example" do
      step_code = {
        occupancies: [
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4",
            modelled_floor_area: 1000
          }
        ]
      }
      step_code_report_generator =
        StepCode::Part3::V0::Compliance::GenerateReports.new(step_code)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        [
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4"
          }
        ]
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
    it "fails in predefined failure case" do
      step_code = {
        occupancies: [
          {
            occupancy: "Group F3 - Low-Hazard Industrial",
            energy_requirement: "NECB",
            modelled_floor_area: 1000
          },
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4",
            modelled_floor_area: 1000
          }
        ]
      }
      step_code_report_generator =
        StepCode::Part3::V0::Compliance::GenerateReports.new(step_code)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        [
          {
            occupancy: "Group F3 - Low-Hazard Industrial",
            energy_requirement: "NECB"
          },
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4"
          }
        ]
      )
      expect(result[:whole_building_performance][:does_building_comply]).to eq(
        { teiu: false, tedi: false, ghgi: false }
      )
      expect(result[:step_code_summary]).to eq(
        { step_achieved: nil, zero_carbon_achieved: nil }
      )
    end

    it "fails on passing example" do
      step_code = {
        occupancies: [
          {
            occupancy: "Group F3 - Low-Hazard Industrial",
            energy_requirement: "NECB",
            modelled_floor_area: 1000
          },
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4",
            modelled_floor_area: 1000
          }
        ]
      }
      step_code_report_generator =
        StepCode::Part3::V0::Compliance::GenerateReports.new(step_code)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        [
          {
            occupancy: "Group F3 - Low-Hazard Industrial",
            energy_requirement: "NECB"
          },
          {
            occupancy: "Group C - Other Residential",
            energy_requirement: "Step 3",
            zero_carbon_requirement: "EL-4"
          }
        ]
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
