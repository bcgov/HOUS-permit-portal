RSpec.describe StepCode::Part3::V1::Compliance::GenerateReports do
  context "single use" do
    it "passes on passing example" do
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
        StepCode::Part3::V1::Compliance::GenerateReports.new(step_code)
      result = step_code_report_generator.call

      expect(result).to eq(
        {
          occupancies: [
            {
              occupancy: "Group C - Other Residential",
              energy_requirement: "Step 3",
              zero_carbon_requirement: "EL-4"
            }
          ],
          whole_building_performance: {
            requirements: {
              teiu: 120,
              tedi: 35,
              ghgi: 1.8
            },
            results_as_modelled: {
              teiu: 101,
              tedi: 30,
              ghgi: 1.1
            },
            corridor_pressurization_adjustment: {
              teiu: 8.5,
              tedi: 8.5,
              ghgi: 0.1
            },
            suite_submetering_adjustment: {
              teiu: 0,
              tedi: nil,
              ghgi: nil
            },
            adjusted_building_compliance: {
              teiu: 93,
              tedi: 22,
              ghgi: 1.0
            },
            does_building_comply: {
              teiu: true,
              tedi: true,
              ghgi: true
            }
          },
          adjusted_step_code_performance_for_compliance: 21.5,
          step_code_summary: {
            step_achieved: "Step 4",
            zero_carbon_achieved: "EL-4"
          }
        }
      )
    end
  end

  context "mixed use" do
    it "fails in predefined failure case" do
    end

    it "passes on passing example" do
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
        StepCode::Part3::V1::Compliance::GenerateReports.new(step_code)
      result = step_code_report_generator.call
      expect(result).to eq(
        {
          occupancies: [
            {
              occupancy: "Group F3 - Low-Hazard Industrial",
              energy_requirement: "NECB"
            },
            {
              occupancy: "Group C - Other Residential",
              energy_requirement: "Step 3",
              zero_carbon_requirement: "EL-4"
            }
          ],
          whole_building_performance: {
            requirements: {
              teiu: 100,
              tedi: 43,
              ghgi: 3.0
            },
            results_as_modelled: {
              teiu: 90,
              tedi: 40,
              ghgi: 2.7
            },
            corridor_pressurization_adjustment: {
              teiu: 4.2,
              tedi: 4.2,
              ghgi: 0
            },
            suite_submetering_adjustment: {
              teiu: 0,
              tedi: nil,
              ghgi: nil
            },
            adjusted_building_compliance: {
              teiu: 86,
              tedi: 36,
              ghgi: 3.0
            },
            does_building_comply: {
              teiu: true,
              tedi: true,
              ghgi: true
            }
          },
          adjusted_step_code_performance_for_compliance: 21.5,
          step_code_summary: {
            step_achieved: "Step 4",
            zero_carbon_achieved: "EL-4"
          }
        }
      )
    end
  end
end
