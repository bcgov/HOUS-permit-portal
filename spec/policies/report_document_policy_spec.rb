require "rails_helper"

RSpec.describe ReportDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:creator) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits download/share only for step code creator" do
    step_code = instance_double("StepCode", creator: creator)
    record = instance_double("ReportDocument", step_code: step_code)

    expect(policy(creator, record).download?).to be true
    expect(policy(creator, record).share?).to be true

    expect(policy(other_user, record).download?).to be false
    expect(policy(other_user, record).share?).to be false
  end

  it "denies download/share when user is nil" do
    step_code = instance_double("StepCode", creator: creator)
    record = instance_double("ReportDocument", step_code: step_code)

    expect(policy(nil, record).download?).to be false
    expect(policy(nil, record).share?).to be false
  end
end
