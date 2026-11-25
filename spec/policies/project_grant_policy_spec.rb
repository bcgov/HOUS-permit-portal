require "rails_helper"

RSpec.describe ProjectGrantPolicy, type: :policy do
  let(:owner) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:application) do
    create(
      :permit_application,
      submitter: owner,
      permit_project: project,
      jurisdiction: jurisdiction
    )
  end
  let(:standard_user) { create(:user, :submitter) }
  let(:expanded_user) { create(:user, :submitter) }
  let(:standard_membership) do
    create(
      :project_membership,
      permit_project: project,
      user: standard_user,
      access: :limited
    )
  end
  let(:expanded_membership) do
    create(
      :project_membership,
      permit_project: project,
      user: expanded_user,
      access: :expanded
    )
  end

  def policy(user, grant)
    policy_for(
      described_class,
      user: user,
      record: grant,
      sandbox: project.sandbox
    )
  end

  def block_grant(actor_membership = standard_membership)
    actor_membership.project_grants.new(
      kind: "block",
      permit_application: application,
      requirement_block_id: SecureRandom.uuid
    )
  end

  it "lets Full and Expanded assign and remove a block grant and an application grant" do
    expanded_membership
    application_grant =
      standard_membership.project_grants.new(
        kind: "application",
        permit_application: application
      )

    [owner, expanded_user].each do |actor|
      expect(policy(actor, block_grant).create?).to be true
      expect(policy(actor, application_grant).create?).to be true
      expect(policy(actor, block_grant).destroy?).to be true
      expect(policy(actor, application_grant).destroy?).to be true
    end
  end

  it "denies Limited and a Full member of another project" do
    outsider = create(:user, :submitter)
    create(:permit_application, submitter: outsider, jurisdiction: jurisdiction)

    standard_membership
    expect(
      policy(standard_user, block_grant(expanded_membership)).create?
    ).to be false
    expect(policy(outsider, block_grant).create?).to be false
    expect(policy(outsider, block_grant).destroy?).to be false
  end

  it "denies assigning a grant to yourself" do
    own =
      project
        .project_memberships
        .find_by!(user: owner)
        .project_grants
        .new(
          kind: "block",
          permit_application: application,
          requirement_block_id: SecureRandom.uuid
        )

    expect(policy(owner, own).create?).to be false
  end

  it "lets Full assign an invite grant and denies Expanded" do
    invite = expanded_membership.project_grants.new(kind: :invite)

    expect(policy(owner, invite).create?).to be true
    expect(policy(owner, invite).destroy?).to be true
    expect(policy(expanded_user, invite).create?).to be false
    expect(policy(expanded_user, invite).destroy?).to be false
  end
end
