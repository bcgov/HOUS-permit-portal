require "rails_helper"

RSpec.describe PermitProjectPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:owner) { create(:user) }
  let(:collaborator_user) { create(:user) }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "owner access" do
    let(:record) do
      instance_double(
        "PermitProject",
        owner_id: owner.id,
        permit_applications: [],
        sandbox: nil
      )
    end

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
      expect(p.submission_collaborator_options?).to be true
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
      expect(p.create_permit_applications?).to be false
    end
  end

  describe "collaborator access" do
    it "permits index/show/pin/unpin/search but denies update/destroy when collaborator on any app" do
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
          sandbox: nil
        )

      p = policy(collaborator_user, record)
      expect(p.index?).to be true
      expect(p.show?).to be true
      expect(p.pin?).to be true
      expect(p.unpin?).to be true
      expect(p.search_permit_applications?).to be true

      expect(p.update?).to be false
      expect(p.destroy?).to be false
      expect(p.create_permit_applications?).to be false
      expect(p.submission_collaborator_options?).to be false
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
          sandbox: nil
        )

      p = policy(create(:user), record)
      expect(p.index?).to be false
      expect(p.show?).to be false
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
      expect(p.mark_as_viewed?).to be true
      expect(p.mark_as_unviewed?).to be true
      expect(p.assign_project_review_collaborator?).to be true
      expect(p.download_notes_csv?).to be true
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
    it "builds a where/distinct query for owner or collaborator and applies sandbox" do
      relation = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")
      sandboxed_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:where) do |sql, binds|
        expect(sql).to include("permit_projects.owner_id = :uid")
        expect(sql).to include("EXISTS")
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
  end
end
