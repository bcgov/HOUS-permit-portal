RSpec.describe StepCode::Part3::V0::GenerateReports do
  let(:reference_energy_outputs) { [] }
  let(:checklist) do
    create(
      :part_3_checklist,
      occupancy_classifications: occupancies,
      reference_energy_outputs: reference_energy_outputs,
      climate_zone: :zone_6,
      ref_annual_thermal_energy_demand: 50_000
    )
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
    let(:electricity_reference) do
      build(
        :energy_output,
        :reference,
        fuel_type: build(:fuel_type, :electricity)
      )
    end
    let(:natural_gas_reference) do
      build(
        :energy_output,
        :reference,
        fuel_type: build(:fuel_type, :natural_gas)
      )
    end
    let(:district_energy_reference) do
      build(
        :energy_output,
        :reference,
        fuel_type: build(:fuel_type, :district_energy)
      )
    end
    let(:reference_energy_outputs) do
      [electricity_reference, natural_gas_reference, district_energy_reference]
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
