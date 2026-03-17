require "rails_helper"

RSpec.describe ProjectDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:owner) { create(:user) }
  let(:other_user) { create(:user) }
  let(:permit_project) { instance_double("PermitProject", owner: owner) }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits download only for project owner" do
    record = instance_double("ProjectDocument", permit_project: permit_project)
    expect(policy(owner, record).download?).to be true
    expect(policy(other_user, record).download?).to be false
  end

  it "denies download when permit_project is missing" do
    record = instance_double("ProjectDocument", permit_project: nil)
    expect(policy(owner, record).download?).to be false
  end
end
