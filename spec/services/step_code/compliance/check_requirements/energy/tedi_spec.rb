RSpec.describe StepCode::Compliance::CheckRequirements::Energy::TEDI do
  let(:step) { 3 }
  let!(:step_code) do
    create(
      :part_9_step_code,
      pre_construction_checklist_attributes: {
        data_entries_attributes:
      }
    )
  end
  subject(:compliance_checker) do
    StepCode::Compliance::CheckRequirements::Energy::TEDI.new(
      checklist: step_code.pre_construction_checklist,
      step: step
    )
  end

  before :each do
    StepCode::TEDIReferencesSeeder.seed!
  end

  context "when tedi is present and does not exceed the energy step requirement" do
    let(:data_entries_attributes) do
      [
        {
          aux_energy_required: 15065.98,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 109.9,
          building_volume: 624.9,
          proposed_gshl: 44.11,
          ref_gshl: 62.35,
          hdd: 2851
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when tedi does not meet energy step requirement but HLR % improvement does" do
    let(:data_entries_attributes) do
      [
        {
          aux_energy_required: 35065.98,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 59.9,
          building_volume: 624.9,
          proposed_gshl: 44.11,
          ref_gshl: 62.35,
          hdd: 2851
        }
      ]
    end

    it_behaves_like PASSING_STEP_CODE
  end

  context "when neither tedi nor HLR % improvement meets energy step requirement" do
    let(:ref_gshl) { 62.35 }
    let(:data_entries_attributes) do
      [
        {
          aux_energy_required: 35065.98,
          above_grade_heated_floor_area: 117.9,
          below_grade_heated_floor_area: 59.9,
          building_volume: 624.9,
          proposed_gshl: 61.11,
          ref_gshl: ref_gshl,
          hdd: 2851
        }
      ]
    end

    context "where the reference house GSHL is specified and compliance path is not 9.36.5" do
      it_behaves_like FAILED_STEP_CODE
    end

    context "where the reference house GSHL is not specified" do
      let(:ref_gshl) { 0 }

      it "sets tedi_hlr_percent to zero" do
        expect(subject.tedi_hlr_percent).to eq 0
      end

      it_behaves_like FAILED_STEP_CODE
    end

    context "where the compliance path is not 9.36.5" do
      before :each do
        allow(step_code.pre_construction_checklist).to receive(
          :compliance_path
        ).and_return(:step_code)
      end

      it "sets tedi_hlr_percent to zero" do
        expect(subject.tedi_hlr_percent).to eq 0
      end

      it_behaves_like FAILED_STEP_CODE
    end
  end
end
