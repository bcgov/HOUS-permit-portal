RSpec.describe StepCode::Compliance::GenerateReports do
  describe "#call" do
    let(:checklist) { create(:part_3_checklist) }
    let(:requirement_one) do
      instance_double(
        Part3StepCode::OccupancyClassification,
        id: 10,
        energy_step_required: 2,
        zero_carbon_step_required: 1
      )
    end
    let(:requirement_two) do
      instance_double(
        Part3StepCode::OccupancyClassification,
        id: 11,
        energy_step_required: 3,
        zero_carbon_step_required: 2
      )
    end
    let(:requirements) { [requirement_one, requirement_two] }
    let(:energy_result) do
      instance_double(StepCode::Compliance::ProposeStep::Energy)
    end
    let(:zero_carbon_result) do
      instance_double(StepCode::Compliance::ProposeStep::ZeroCarbon)
    end

    it "builds a report entry for each requirement" do
      allow(StepCode::Compliance::ProposeStep::Energy).to receive(
        :new
      ).and_return(
        instance_double(
          StepCode::Compliance::ProposeStep::Energy,
          call: energy_result
        )
      )
      allow(StepCode::Compliance::ProposeStep::ZeroCarbon).to receive(
        :new
      ).and_return(
        instance_double(
          StepCode::Compliance::ProposeStep::ZeroCarbon,
          call: zero_carbon_result
        )
      )

      service =
        described_class.new(
          checklist: checklist,
          requirements: requirements
        ).call

      expect(service.reports).to eq(
        [
          {
            zero_carbon: zero_carbon_result,
            energy: energy_result,
            requirement_id: 10
          },
          {
            zero_carbon: zero_carbon_result,
            energy: energy_result,
            requirement_id: 11
          }
        ]
      )
    end
  end
end
