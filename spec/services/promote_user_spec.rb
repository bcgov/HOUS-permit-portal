require "rails_helper"

RSpec.describe PromoteUser do
  before { allow(ActiveRecord::Base).to receive(:transaction).and_yield }

  def stub_overheating_codes(invited_user)
    overheating_codes = double("OverheatingCodes")
    allow(invited_user).to receive(:overheating_codes).and_return(
      overheating_codes
    )
    allow(overheating_codes).to receive(:update_all)
    overheating_codes
  end

  it "merges invitation fields and jurisdictions and destroys invited user when valid" do
    existing_user =
      instance_double(
        "User",
        jurisdiction_ids: ["j1"],
        id: "e1",
        permit_projects: PermitProject.none,
        project_memberships: ProjectMembership.none
      )
    invited_user =
      instance_double("User", jurisdiction_ids: ["j2"], submitter?: false)

    allow(invited_user).to receive(:slice).and_return(
      { "invitation_token" => "t", "role" => "review_manager" }
    )
    allow(existing_user).to receive(:assign_attributes)
    allow(existing_user).to receive(:valid?).and_return(true)
    allow(existing_user).to receive(:jurisdiction_ids=)
    allow(existing_user).to receive(:save!)

    allow(invited_user).to receive(:destroy!)
    allow(invited_user).to receive(:reload)
    allow(invited_user).to receive(:collaborations).and_return([])
    stub_overheating_codes(invited_user)

    service =
      described_class.new(
        existing_user: existing_user,
        invited_user: invited_user
      ).call

    expect(existing_user).to have_received(:assign_attributes).with(
      hash_including("invitation_token" => "t")
    )
    expect(invited_user).to have_received(:destroy!)
    expect(existing_user).to have_received(:jurisdiction_ids=).with(%w[j1 j2])
    expect(existing_user).to have_received(:save!)
    expect(service.existing_user).to eq(existing_user)
  end

  it "does not merge when existing user is invalid" do
    existing_user = instance_double("User", jurisdiction_ids: [])
    invited_user =
      instance_double("User", jurisdiction_ids: [], submitter?: true)
    allow(invited_user).to receive(:destroy!)
    allow(invited_user).to receive(:slice).and_return({})
    allow(existing_user).to receive(:assign_attributes)
    allow(existing_user).to receive(:valid?).and_return(false)

    allow(invited_user).to receive(:collaborations).and_return([])

    described_class.new(
      existing_user: existing_user,
      invited_user: invited_user
    ).call

    expect(invited_user).not_to have_received(:destroy!)
  end

  it "merges collaborations by updating collaborator user when missing on existing user" do
    existing_collabs = double("ExistingCollabs")
    invited_collabs = []

    existing_user =
      instance_double(
        "User",
        jurisdiction_ids: [],
        collaborations: existing_collabs,
        id: "e1",
        permit_projects: PermitProject.none,
        project_memberships: ProjectMembership.none
      )
    invited_user =
      instance_double(
        "User",
        jurisdiction_ids: [],
        collaborations: invited_collabs,
        submitter?: true,
        reload: true
      )

    allow(invited_user).to receive(:slice).and_return({})
    allow(existing_user).to receive(:assign_attributes)
    allow(existing_user).to receive(:valid?).and_return(true)
    allow(existing_user).to receive(:jurisdiction_ids=)
    allow(existing_user).to receive(:save!)
    allow(invited_user).to receive(:destroy!)
    allow(invited_user).to receive(:reload)
    stub_overheating_codes(invited_user)

    invited_user_collab =
      instance_double(
        "Collaborator",
        jurisdiction_id: "j1",
        permit_collaborations: [],
        update: true
      )
    allow(invited_user).to receive(:collaborations).and_return(
      [invited_user_collab]
    )
    allow(existing_collabs).to receive(:find_by).with(
      jurisdiction_id: "j1"
    ).and_return(nil)

    described_class.new(
      existing_user: existing_user,
      invited_user: invited_user
    ).call

    expect(invited_user_collab).to have_received(:update).with(
      user: existing_user
    )
  end

  it "reassigns overheating codes from invited user before destroy" do
    allow(ActiveRecord::Base).to receive(:transaction).and_call_original

    existing_user = create(:user, :submitter)
    invited_user = create(:user, :review_manager, confirmed: false)
    overheating_code = create(:overheating_code, creator: invited_user)
    live_project = create(:permit_project, owner: existing_user)

    described_class.new(
      existing_user: existing_user,
      invited_user: invited_user
    ).call

    expect(overheating_code.reload.creator_id).to eq(existing_user.id)
    expect(User.exists?(invited_user.id)).to be false
    expect(PermitProject.unscoped.exists?(live_project.id)).to be false
  end

  def promote(existing_user)
    invited_user = create(:user, :review_manager, confirmed: false)
    described_class.new(existing_user:, invited_user:).call
  end

  it "keeps a live project another full member still holds" do
    allow(ActiveRecord::Base).to receive(:transaction).and_call_original

    existing_user = create(:user, :submitter)
    project = create(:permit_project, owner: existing_user)
    other = create(:project_membership, permit_project: project, access: :full)
    membership = project.project_memberships.find_by!(user: existing_user)
    membership.update!(access: :limited)
    application =
      create(
        :permit_application,
        :newly_submitted,
        permit_project: project,
        submitter: existing_user
      )
    grant =
      create(
        :project_grant,
        project_membership: membership,
        permit_application: application
      )

    promote(existing_user)

    project.reload
    application.reload
    expect(project).not_to be_discarded
    expect(project.owner_id).to be_nil
    expect(project.first_name_snapshot).to eq(existing_user.first_name)
    expect(ProjectMembership.exists?(membership.id)).to be false
    expect(ProjectMembership.exists?(other.id)).to be true
    expect(ProjectGrant.exists?(grant.id)).to be false
    expect(application.submitter_membership_id).to be_nil
    expect(application).not_to be_discarded
  end

  it "removes a full membership on someone else's live project" do
    allow(ActiveRecord::Base).to receive(:transaction).and_call_original

    existing_user = create(:user, :submitter)
    creator = create(:user, :submitter)
    project = create(:permit_project, owner: creator)
    membership =
      create(
        :project_membership,
        permit_project: project,
        user: existing_user,
        access: :full
      )

    promote(existing_user)

    expect(project.reload.owner_id).to eq(creator.id)
    expect(project).not_to be_discarded
    expect(ProjectMembership.exists?(membership.id)).to be false
    expect(project.project_memberships.find_by(user: creator)).to be_present
  end

  it "abandons a live project when the promoted user is the last full member" do
    allow(ActiveRecord::Base).to receive(:transaction).and_call_original

    existing_user = create(:user, :submitter)
    project = create(:permit_project, owner: existing_user)
    create(
      :permit_application,
      :newly_submitted,
      permit_project: project,
      submitter: existing_user
    )

    promote(existing_user)

    project = PermitProject.unscoped.find(project.id)
    expect(project).to be_discarded
    expect(project.orphaned_at).to be_present
  end

  it "keeps a sandbox project they own" do
    allow(ActiveRecord::Base).to receive(:transaction).and_call_original

    existing_user = create(:user, :submitter)
    jurisdiction = create(:sub_district)
    sandbox = create(:sandbox, jurisdiction: jurisdiction)
    project =
      create(
        :permit_project,
        owner: existing_user,
        jurisdiction: jurisdiction,
        sandbox: sandbox
      )
    membership = project.project_memberships.find_by!(user: existing_user)

    promote(existing_user)

    expect(project.reload).not_to be_discarded
    expect(project.owner_id).to eq(existing_user.id)
    expect(ProjectMembership.exists?(membership.id)).to be true
  end
end
