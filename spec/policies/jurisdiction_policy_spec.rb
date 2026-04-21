require "rails_helper"

RSpec.describe JurisdictionPolicy, type: :policy do
  subject(:policy_class) { described_class }

  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }

  let(:user_context) { UserContext.new(user, sandbox) }

  permissions :show? do
    let(:user) { nil }

    it "permits anyone" do
      expect(policy_class).to permit(user_context, jurisdiction)
    end
  end

  permissions :locality_type_options? do
    let(:user) { nil }

    it "permits anyone" do
      expect(policy_class).to permit(user_context, jurisdiction)
    end
  end

  permissions :index? do
    let(:user) { nil }

    it "permits anyone" do
      expect(policy_class).to permit(user_context, jurisdiction)
    end
  end

  permissions :jurisdiction_options? do
    let(:user) { nil }

    it "permits anyone" do
      expect(policy_class).to permit(user_context, jurisdiction)
    end
  end

  permissions :create? do
    let(:user) { create(:user) }

    it "permits only super_admin" do
      expect(policy_class).not_to permit(user_context, jurisdiction)
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        jurisdiction
      )
    end
  end

  permissions :update? do
    let(:user) { create(:user) }

    it "permits super_admin" do
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        jurisdiction
      )
    end

    it "permits review staff members of the jurisdiction" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      expect(policy_class).to permit(
        UserContext.new(reviewer, sandbox),
        jurisdiction
      )
    end

    it "permits technical_support members of the jurisdiction" do
      tech = create(:user, role: :technical_support)
      create(:jurisdiction_membership, user: tech, jurisdiction: jurisdiction)
      tech.reload
      expect(policy_class).to permit(
        UserContext.new(tech, sandbox),
        jurisdiction
      )
    end

    it "denies non-members" do
      reviewer = create(:user, :review_manager)
      expect(policy_class).not_to permit(
        UserContext.new(reviewer, sandbox),
        jurisdiction
      )
    end
  end

  permissions :search_users? do
    let(:user) { create(:user) }

    it "matches update? permissions" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      expect(policy_class).to permit(
        UserContext.new(reviewer, sandbox),
        jurisdiction
      )

      stranger = create(:user, :review_manager)
      expect(policy_class).not_to permit(
        UserContext.new(stranger, sandbox),
        jurisdiction
      )
    end
  end

  permissions :search_permit_applications? do
    let(:user) { create(:user) }

    it "matches update? permissions" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      expect(policy_class).to permit(
        UserContext.new(reviewer, sandbox),
        jurisdiction
      )

      stranger = create(:user)
      expect(policy_class).not_to permit(
        UserContext.new(stranger, sandbox),
        jurisdiction
      )
    end
  end

  permissions :sandboxes? do
    let(:user) { create(:user) }

    it "matches update? permissions" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      expect(policy_class).to permit(
        UserContext.new(reviewer, sandbox),
        jurisdiction
      )

      stranger = create(:user)
      expect(policy_class).not_to permit(
        UserContext.new(stranger, sandbox),
        jurisdiction
      )
    end
  end

  permissions :update_external_api_enabled? do
    let(:user) { create(:user) }

    it "permits super_admin" do
      allow(jurisdiction).to receive(:g_off?).and_return(false)
      expect(policy_class).to permit(
        UserContext.new(create(:user, :super_admin), sandbox),
        jurisdiction
      )
    end

    it "permits manager members when not g_off" do
      allow(jurisdiction).to receive(:g_off?).and_return(false)
      manager = create(:user, :review_manager, jurisdiction:)
      expect(policy_class).to permit(
        UserContext.new(manager, sandbox),
        jurisdiction
      )
    end

    it "denies when g_off" do
      allow(jurisdiction).to receive(:g_off?).and_return(true)
      manager = create(:user, :review_manager, jurisdiction:)
      expect(policy_class).not_to permit(
        UserContext.new(manager, sandbox),
        jurisdiction
      )
    end

    it "permits technical_support members when not g_off" do
      allow(jurisdiction).to receive(:g_off?).and_return(false)
      tech = create(:user, role: :technical_support)
      create(:jurisdiction_membership, user: tech, jurisdiction: jurisdiction)
      tech.reload

      expect(policy_class).to permit(
        UserContext.new(tech, sandbox),
        jurisdiction
      )
    end
  end

  describe "Scope" do
    it "returns all" do
      relation = double("Relation", all: :all)
      resolved =
        described_class::Scope.new(
          UserContext.new(create(:user), sandbox),
          relation
        ).resolve
      expect(resolved).to eq(:all)
    end
  end
end
