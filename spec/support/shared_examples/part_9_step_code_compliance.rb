require "rails_helper"

STEP_CODE_COMPLIANCE_CHECK = "a Step Code compliance check"
PASSING_STEP_CODE = "a passing Step Code requirement"
FAILED_STEP_CODE = "a failed Step Code requirement"

RSpec.shared_examples STEP_CODE_COMPLIANCE_CHECK do
  it "sets the proposed step as expected" do
    expect(subject.step).to eq(expected_step)
  end
end

RSpec.shared_examples PASSING_STEP_CODE do
  it "returns true" do
    expect(subject.requirements_met?).to be true
  end
end

RSpec.shared_examples FAILED_STEP_CODE do
  it "returns false" do
    expect(subject.requirements_met?).to be false
  end
end
