RSpec.describe StepCode::Compliance::ProposeStep::Base do
  let(:step_code) { build(:step_code) }
  let(:minimum_step) { StepCode::Compliance::ProposeStep::Base::MIN_REQUIRED_STEP }
  subject(:compliance_checker) do
    StepCode::Compliance::ProposeStep::Base.new(checklist: step_code.pre_construction_checklist)
  end

  before :each do
    iterations = expected_step ? expected_step - minimum_step + 2 : 1
    results =
      Array.new(iterations) do |n|
        step = minimum_step + n
        expected_step ? step <= expected_step : false
      end
    allow(subject).to receive(:requirements_met?).and_return(*results)
    subject.call
  end

  context "when requirements are not met for the minimum step" do
    let(:expected_step) { nil }

    it_behaves_like "a step code compliance check"
  end

  context "when requirements are met for the minimum step" do
    let(:expected_step) { minimum_step }

    it_behaves_like "a step code compliance check"
  end

  context "when requirements are met for a step beyond the minimum step" do
    let(:expected_step) { minimum_step + 1 }

    it_behaves_like "a step code compliance check"
  end
end
