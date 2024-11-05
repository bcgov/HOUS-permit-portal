RSpec.describe StepCode::Part3::V0::Compliance::GenerateReports do
  let(:checklist) do
    build(:part_3_checklist, occupancy_classifications: occupancies)
  end

  context "single use not yet implemented" do
    let(:occupancies) { build_list(:step_code_occupancy, 1) }

    it "fails in predefined failure case" do
      step_code_report_generator =
        StepCode::Part3::V0::Compliance::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        occupancies.map do |occupancy|
          {
            occupancy: occupancy.name,
            energy_requirement: occupancy.energy_step_required,
            zero_carbon_requirement: occupancy.zero_carbon_step_required
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
        StepCode::Part3::V0::Compliance::GenerateReports.new(checklist)
      result = step_code_report_generator.call

      expect(result[:occupancies]).to eq(
        occupancies.map do |occupancy|
          {
            occupancy: occupancy.name,
            energy_requirement: occupancy.energy_step_required,
            zero_carbon_requirement: occupancy.zero_carbon_step_required
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
      build_list(:step_code_occupancy, 2) do |oc, i|
        oc.name = Part3StepCode::OccupancyClassification.keys[i]
      end
    end

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
