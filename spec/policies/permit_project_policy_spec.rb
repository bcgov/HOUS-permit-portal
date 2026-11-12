require "rails_helper"

RSpec.describe PermitProjectPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:owner) { create(:user) }
  let(:collaborator_user) { create(:user) }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "lets Expanded download project notes and denies Standard" do
    project = create(:permit_project)
    expanded = create(:user, :submitter)
    standard = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: project,
      user: expanded,
      access: :expanded
    )
    create(
      :project_membership,
      permit_project: project,
      user: standard,
      access: :standard
    )

    expect(policy(expanded, project).download_notes_csv?).to be true
    expect(policy(standard, project).download_notes_csv?).to be false
  end

  describe "owner access" do
    let(:record) { create(:permit_project, owner:, sandbox: nil) }

    it "permits index/show/update/destroy for owner" do
      p = policy(owner, record)
      expect(p.index?).to be true
      expect(p.show?).to be true
      expect(p.update?).to be true
      expect(p.destroy?).to be true
      expect(p.pin?).to be true
      expect(p.unpin?).to be true
      expect(p.search_permit_applications?).to be true
      expect(p.create_permit_applications?).to be true
      expect(p.download_notes_csv?).to be true
    end

    it "denies owner actions when the request sandbox does not match the project" do
      jurisdiction = create(:sub_district)
      published_sandbox = jurisdiction.sandboxes.published.first
      record =
        create(
          :permit_project,
          owner:,
          jurisdiction:,
          sandbox: published_sandbox
        )
      p = policy(owner, record)

      expect(p.show?).to be false
      expect(p.update?).to be false
      expect(p.destroy?).to be false
      expect(p.pin?).to be false
      expect(p.search_permit_applications?).to be false
      expect(p.create_permit_applications?).to be false
    end
  end

  describe "membership access" do
    let(:record) { create(:permit_project, owner:, sandbox: nil) }

    it "lets another Full member update and denies Expanded and Standard" do
      full_member = create(:user)
      expanded_member = create(:user)
      standard_member = create(:user)
      create(
        :project_membership,
        permit_project: record,
        user: full_member,
        access: :full
      )
      create(
        :project_membership,
        permit_project: record,
        user: expanded_member,
        access: :expanded
      )
      create(
        :project_membership,
        permit_project: record,
        user: standard_member,
        access: :standard
      )

      expect(policy(full_member, record).update?).to be true
      expect(policy(expanded_member, record).update?).to be false
      expect(policy(standard_member, record).update?).to be false
      expect(policy(full_member, record).search_permit_applications?).to be true
      expect(
        policy(expanded_member, record).search_permit_applications?
      ).to be true
      expect(
        policy(standard_member, record).search_permit_applications?
      ).to be true
    end
  end

  describe "collaborator access" do
    it "does not grant member actions to an application collaborator" do
      app =
        instance_double(
          "PermitApplication",
          collaborators: [
            instance_double("Collaborator", user_id: collaborator_user.id)
          ]
        )
      record =
        instance_double(
          "PermitProject",
          owner_id: owner.id,
          permit_applications: [app],
          persisted?: false,
          sandbox: nil
        )

      p = policy(collaborator_user, record)
      expect(p.index?).to be false
      expect(p.show?).to be false
      expect(p.pin?).to be false
      expect(p.unpin?).to be false
      expect(p.search_permit_applications?).to be false
      expect(p.update?).to be false
      expect(p.destroy?).to be false
      expect(p.create_permit_applications?).to be false
    end
  end

  describe "non-collaborator access" do
    it "denies index/show when not owner and no collaborator match" do
      app =
        instance_double(
          "PermitApplication",
          collaborators: [
            instance_double("Collaborator", user_id: "someone-else")
          ]
        )
      record =
        instance_double(
          "PermitProject",
          owner_id: owner.id,
          permit_applications: [app],
          persisted?: false,
          sandbox: nil
        )

      p = policy(create(:user), record)
      expect(p.index?).to be false
      expect(p.show?).to be false
      expect(p.search_permit_applications?).to be false
    end
  end

  describe "#create? and #jurisdiction_options?" do
    it "permits create and jurisdiction_options for anyone" do
      record =
        instance_double(
          "PermitProject",
          owner_id: owner.id,
          permit_applications: [],
          sandbox: nil
        )
      p = policy(create(:user), record)
      expect(p.create?).to be true
      expect(p.jurisdiction_options?).to be true
    end
  end

  describe "review staff access" do
    let(:jurisdiction) { create(:sub_district) }
    let(:reviewer) { create(:user, :review_manager, jurisdiction:) }
    let(:published_sandbox) { jurisdiction.sandboxes.published.first }

    it "permits show and inbox actions for a live project when the request is live" do
      record = create(:permit_project, jurisdiction:, sandbox: nil)
      p = policy(reviewer, record)

      expect(p.show?).to be true
      expect(p.update?).to be false
      expect(p.mark_as_viewed?).to be true
      expect(p.mark_as_unviewed?).to be true
      expect(p.assign_project_review_collaborator?).to be true
      expect(p.download_notes_csv?).to be true
      expect(p.search_permit_applications?).to be true
      expect(p.create_permit_applications?).to be true
    end

    it "denies show and inbox actions when the project is in another sandbox" do
      record =
        create(:permit_project, jurisdiction:, sandbox: published_sandbox)
      p = policy(reviewer, record)

      expect(p.show?).to be false
      expect(p.mark_as_viewed?).to be false
      expect(p.mark_as_unviewed?).to be false
      expect(p.assign_project_review_collaborator?).to be false
      expect(p.download_notes_csv?).to be false
    end

    it "denies show when review staff are a collaborator on another jurisdiction's project" do
      other_jurisdiction = create(:sub_district)
      application =
        create(:permit_application, jurisdiction: other_jurisdiction)
      # A review collaborator must belong to the application's jurisdiction.
      # Persist the row anyway. It must not grant project access.
      collaborator =
        Collaborator.new(user: reviewer, jurisdiction: other_jurisdiction)
      collaborator.save!(validate: false)
      PermitCollaboration.new(
        collaborator: collaborator,
        permit_application: application,
        collaborator_type: :delegatee
      ).save!(validate: false)

      p = policy(reviewer, application.permit_project)

      expect(p.show?).to be false
      expect(p.create_permit_applications?).to be false
    end

    it "permits show for a sandboxed project when the request uses that sandbox" do
      record =
        create(:permit_project, jurisdiction:, sandbox: published_sandbox)
      p =
        policy_for(
          described_class,
          user: reviewer,
          record:,
          sandbox: published_sandbox
        )

      expect(p.show?).to be true
      expect(p.mark_as_viewed?).to be true
    end
  end

  describe "super admin access" do
    it "does not apply the sandbox gate when the super_admin is the owner" do
      admin = create(:user, :super_admin)
      jurisdiction = create(:sub_district)
      published_sandbox = jurisdiction.sandboxes.published.first
      record =
        create(
          :permit_project,
          owner: admin,
          jurisdiction:,
          sandbox: published_sandbox
        )
      p = policy(admin, record)

      expect(p.show?).to be true
      expect(p.update?).to be true
    end
  end

  describe "Scope" do
    it "builds a where/distinct query for a member or collaborator and applies sandbox" do
      relation = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")
      sandboxed_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:where) do |sql, binds|
        expect(sql).to include("project_memberships")
        expect(sql).to include("pm.user_id = :uid")
        expect(sql).not_to include("permit_projects.owner_id")
        expect(sql).to include("permit_collaborations")
        expect(binds).to eq(uid: owner.id)
        where_rel
      end
      expect(where_rel).to receive(:distinct).and_return(distinct_rel)
      expect(distinct_rel).to receive(:where).with(sandbox_id: nil).and_return(
        sandboxed_rel
      )

      resolved =
        described_class::Scope.new(
          UserContext.new(owner, sandbox),
          relation
        ).resolve
      expect(resolved).to eq(sandboxed_rel)
    end

    it "scopes review staff to their jurisdictions then the current sandbox" do
      jurisdiction = create(:sub_district)
      reviewer = create(:user, :review_manager, jurisdiction:)
      published_sandbox = jurisdiction.sandboxes.published.first
      relation = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")
      sandboxed_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:where) do |sql, binds|
        expect(sql).to include("permit_projects.jurisdiction_id IN (:jur_ids)")
        expect(sql).not_to include("sandbox_id")
        expect(binds[:jur_ids]).to include(jurisdiction.id)
        where_rel
      end
      expect(where_rel).to receive(:distinct).and_return(distinct_rel)
      expect(distinct_rel).to receive(:where).with(
        sandbox_id: published_sandbox.id
      ).and_return(sandboxed_rel)

      resolved =
        described_class::Scope.new(
          UserContext.new(reviewer, published_sandbox),
          relation
        ).resolve
      expect(resolved).to eq(sandboxed_rel)
    end

    it "does not apply sandbox for super_admin" do
      admin = create(:user, :super_admin)
      relation = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:where).and_return(where_rel)
      expect(where_rel).to receive(:distinct).and_return(distinct_rel)
      expect(distinct_rel).not_to receive(:where)

      resolved =
        described_class::Scope.new(
          UserContext.new(admin, sandbox),
          relation
        ).resolve
      expect(resolved).to eq(distinct_rel)
    end

    it "excludes a Full member of a different project" do
      jurisdiction = create(:sub_district)
      record = create(:permit_project, jurisdiction: jurisdiction, sandbox: nil)
      outsider = create(:user, :submitter)
      other_application =
        create(
          :permit_application,
          submitter: outsider,
          jurisdiction: jurisdiction,
          sandbox: nil
        )
      expect(
        other_application.permit_project.project_memberships.find_by!(
          user: outsider
        )
      ).to be_full

      resolved =
        described_class::Scope.new(
          UserContext.new(outsider, nil),
          PermitProject.all
        ).resolve

      expect(resolved).to include(other_application.permit_project)
      expect(resolved).not_to include(record)
    end
  end

  describe "a Full member of a different project" do
    let(:jurisdiction) { create(:sub_district) }
    let(:record) do
      create(:permit_project, jurisdiction: jurisdiction, sandbox: nil)
    end
    let(:outsider) { create(:user, :submitter) }
    let(:other_application) do
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: jurisdiction,
        sandbox: nil
      )
    end
    let(:other_project) { other_application.permit_project }

    def expect_outsider_is_full
      expect(
        other_project.project_memberships.find_by!(user: outsider)
      ).to be_full
    end

    it "show? and search_permit_applications? deny a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(outsider, other_project).show?).to be true
      expect(
        policy(outsider, other_project).search_permit_applications?
      ).to be true
      expect(policy(outsider, record).show?).to be false
      expect(policy(outsider, record).search_permit_applications?).to be false
    end

    it "index? and pinned? deny a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(outsider, other_project).index?).to be true
      expect(policy(outsider, other_project).pinned?).to be true
      expect(policy(outsider, record).index?).to be false
      expect(policy(outsider, record).pinned?).to be false
    end

    it "update? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(outsider, other_project).update?).to be true
      expect(policy(outsider, record).update?).to be false
    end

    it "destroy? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(outsider, other_project).destroy?).to be true
      expect(policy(outsider, record).destroy?).to be false
    end

    it "pin? and unpin? deny a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(outsider, other_project).pin?).to be true
      expect(policy(outsider, other_project).unpin?).to be true
      expect(policy(outsider, record).pin?).to be false
      expect(policy(outsider, record).unpin?).to be false
    end

    it "create_permit_applications? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(
        policy(outsider, other_project).create_permit_applications?
      ).to be true
      expect(policy(outsider, record).create_permit_applications?).to be false
    end

    it "download_notes_csv? denies a Full member of a different project" do
      expect_outsider_is_full

      expect(policy(outsider, other_project).download_notes_csv?).to be true
      expect(policy(outsider, record).download_notes_csv?).to be false
    end
  end
end
