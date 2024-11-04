RSpec.describe StepCode::Part3::V1::GenerateReports do
  let(:checklist) do
    build(:part_3_checklist, occupancy_classifications: occupancies)
  end

  context "single use" do
    let(:occupancies) do
      [*build_list(:step_code_occupancy, 1, :other_residential)]
    end
    it "passes on passing example" do
      step_code_report_generator =
        StepCode::Part3::V1::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result).to eq(
        {
          occupancies: [
            {
              occupancy: "residential",
              energy_requirement: :step_3,
              zero_carbon_requirement: :el_4,
              performance_requirement: nil
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
            step_achieved: "step_4",
            zero_carbon_achieved: "el_4"
          }
        }
      )
    end
  end

  context "mixed use" do
    let(:occupancies) do
      [
        *build_list(:step_code_occupancy, 1, :other_residential),
        *build_list(:step_code_occupancy, 1, :low_industrial)
      ]
    end

    it "fails in predefined failure case" do
    end

    it "passes on passing example" do
      step_code_report_generator =
        StepCode::Part3::V1::GenerateReports.new(checklist)
      result = step_code_report_generator.call
      expect(result).to eq(
        {
          occupancies: [
            {
              occupancy: "residential",
              energy_requirement: "step_3",
              zero_carbon_requirement: "el_4",
              performance_requirement: nil
            },
            {
              occupancy: "low_hazard_industrial",
              energy_requirement: nil,
              zero_carbon_requirement: nil,
              performance_requirement: :necb
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
            step_achieved: "step_3",
            zero_carbon_achieved: "el_4"
          }
        }
      )
    end
  end
end
