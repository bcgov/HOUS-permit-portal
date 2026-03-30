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

  describe "Scope" do
    it "builds a left_joins/where/distinct query for owner or collaborator user" do
      relation = instance_double("ActiveRecord::Relation")
      joined = instance_double("ActiveRecord::Relation")
      where_rel = instance_double("ActiveRecord::Relation")
      distinct_rel = instance_double("ActiveRecord::Relation")

      expect(relation).to receive(:left_joins).with(:collaborators).and_return(
        joined
      )
      expect(joined).to receive(:where).with(
        "permit_projects.owner_id = :uid OR collaborators.user_id = :uid",
        uid: owner.id
      ).and_return(where_rel)
      expect(where_rel).to receive(:distinct).and_return(distinct_rel)

      resolved =
        described_class::Scope.new(
          UserContext.new(owner, sandbox),
          relation
        ).resolve
      expect(resolved).to eq(distinct_rel)
    end
  end
end
