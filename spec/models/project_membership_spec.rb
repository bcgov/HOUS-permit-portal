require "rails_helper"

RSpec.describe ProjectMembership, type: :model do
  it "rejects a second membership for the same user and project" do
    membership = create(:project_membership)
    duplicate =
      build(
        :project_membership,
        user: membership.user,
        permit_project: membership.permit_project
      )

    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:user_id]).to be_present
  end

  it "gives the creator a full primary membership" do
    project = create(:permit_project)
    membership = project.project_memberships.find_by!(user: project.creator)

    expect(membership.access).to eq("full")
    expect(membership.contact_designation).to eq("primary")
    expect(project.creator_id).to eq(project.owner_id)
  end

  it "allows several alternates and only one primary" do
    project = create(:permit_project)
    create(
      :project_membership,
      permit_project: project,
      contact_designation: :alternate
    )
    create(
      :project_membership,
      permit_project: project,
      contact_designation: :alternate
    )

    extra_primary =
      build(
        :project_membership,
        permit_project: project,
        contact_designation: :primary
      )
    expect(extra_primary).not_to be_valid
  end

  it "stores whatever role tags it is given" do
    membership = create(:project_membership)
    membership.role_list = %w[Architect Builder]
    membership.save!

    expect(membership.reload.role_list).to contain_exactly(
      "Architect",
      "Builder"
    )
  end
end
