require "rails_helper"

RSpec.describe ProjectMembershipPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:owner) { create(:user, :submitter) }
  let(:project) { create(:permit_project, owner: owner) }
  let(:membership) do
    create(
      :project_membership,
      permit_project: project,
      user: create(:user, :submitter)
    )
  end

  def policy(record, acting_user: owner)
    policy_for(
      described_class,
      user: acting_user,
      record: record,
      sandbox: sandbox
    )
  end

  it "lets the project owner update and remove another member" do
    expect(policy(membership).update?).to be true
    expect(policy(membership).destroy?).to be true
  end

  it "forbids a member who does not own the project" do
    member = create(:user, :submitter)

    expect(policy(membership, acting_user: member).update?).to be false
    expect(policy(membership, acting_user: member).destroy?).to be false
  end
end
