RSpec.describe StepCode::Compliance::ProposeStep::Base do
  let(:step_code) { build(:part_9_step_code) }
  let(:min_required_step) { 3 }
  let(:min_step) { 3 }
  let(:max_step) { 5 }

  subject(:compliance_checker) do
    StepCode::Compliance::ProposeStep::Base.new(
      checklist: step_code.pre_construction_checklist,
      min_required_step:
    )
  end

  before :each do
    iterations =
      expected_step ? expected_step - (min_required_step || min_step) + 2 : 1
    results =
      Array.new(iterations) do |n|
        step = (min_required_step || min_step) + n
        expected_step ? step <= expected_step : false
      end
    allow(subject).to receive(:max_step).and_return max_step
    allow(subject).to receive(:min_step).and_return min_step
    allow(subject).to receive(:requirements_met?).and_return(*results)
    subject.call
  end

  context "when requirements are not met for the minimum step" do
    let(:expected_step) { nil }

    it_behaves_like STEP_CODE_COMPLIANCE_CHECK
  end

  context "when requirements are met for the minimum step" do
    let(:expected_step) { min_step }

    it_behaves_like STEP_CODE_COMPLIANCE_CHECK
  end

  context "when requirements are met for a step beyond the minimum step" do
    let(:expected_step) { min_step + 1 }

    it_behaves_like STEP_CODE_COMPLIANCE_CHECK
  end

  context "when requirements are met for the maximum step" do
    let(:expected_step) { max_step }

    it_behaves_like STEP_CODE_COMPLIANCE_CHECK
  end

  context "when there is no minimum required step" do
    let(:min_required_step) { nil }
    let(:expected_step) { min_step }

    it_behaves_like STEP_CODE_COMPLIANCE_CHECK
  end
end
