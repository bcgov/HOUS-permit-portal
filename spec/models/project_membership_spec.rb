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

  it "rejects the project owner" do
    project = create(:permit_project)
    membership =
      build(:project_membership, user: project.owner, permit_project: project)

    expect(membership).not_to be_valid
    expect(membership.errors[:user]).to include("is the project owner")
  end

  it "allows one primary and one alternate, and no second of either" do
    project = create(:permit_project)
    create(
      :project_membership,
      permit_project: project,
      contact_designation: :primary
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

    extra_primary.contact_designation = :alternate
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
