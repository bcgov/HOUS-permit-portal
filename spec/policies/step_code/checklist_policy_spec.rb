require "rails_helper"

RSpec.describe StepCode::ChecklistPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }
  let(:user) { create(:user, :submitter) }
  let(:step_code) { double("StepCode") }
  let(:record) { instance_double("StepCodeChecklist", step_code: step_code) }

  subject(:policy) { policy_for(described_class, user:, record:, sandbox:) }

  it "delegates show? to StepCodePolicy" do
    step_code_policy =
      instance_double("StepCodePolicy", show?: true, update?: false)
    expect(StepCodePolicy).to receive(:new).with(
      instance_of(UserContext),
      step_code
    ).and_return(step_code_policy)

    expect(policy.show?).to be true
  end

  it "delegates update? to StepCodePolicy" do
    step_code_policy =
      instance_double("StepCodePolicy", show?: false, update?: true)
    expect(StepCodePolicy).to receive(:new).with(
      instance_of(UserContext),
      step_code
    ).and_return(step_code_policy)

    expect(policy.update?).to be true
  end
end
