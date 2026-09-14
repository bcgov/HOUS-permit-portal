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
        permit_applications: []
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
          permit_applications: [app]
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
          permit_applications: [app]
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
          permit_applications: []
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

  describe "Scope" do
    it "builds a where/distinct query for owner or collaborator (EXISTS subquery, no joins)" do
      relation = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:where) do |sql, binds|
        expect(sql).to include("permit_projects.owner_id = :uid")
        expect(sql).to include("EXISTS")
        expect(sql).to include("permit_collaborations")
        expect(binds).to eq(uid: owner.id)
        where_rel
      end
      expect(where_rel).to receive(:distinct).and_return(distinct_rel)

      resolved =
        described_class::Scope.new(
          UserContext.new(owner, sandbox),
          relation
        ).resolve
      expect(resolved).to eq(distinct_rel)
    end

    it "scopes review staff to their jurisdictions and the current sandbox" do
      jurisdiction = create(:sub_district)
      reviewer = create(:user, :review_manager, jurisdiction:)
      published_sandbox = jurisdiction.sandboxes.published.first
      relation = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:where) do |sql, binds|
        expect(sql).to include("permit_projects.jurisdiction_id IN (:jur_ids)")
        expect(sql).to include(
          "permit_projects.sandbox_id IS NOT DISTINCT FROM :sandbox_id"
        )
        expect(binds[:jur_ids]).to include(jurisdiction.id)
        expect(binds[:sandbox_id]).to eq(published_sandbox.id)
        where_rel
      end
      expect(where_rel).to receive(:distinct).and_return(distinct_rel)

      resolved =
        described_class::Scope.new(
          UserContext.new(reviewer, published_sandbox),
          relation
        ).resolve
      expect(resolved).to eq(distinct_rel)
    end
  end
end
