require "rails_helper"

RSpec.describe ExternalApiKeyPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
  let(:sandbox) { jurisdiction.sandboxes.first }
  let(:external_api_key) { create(:external_api_key, jurisdiction:, sandbox:) }

  def policy(user, record: external_api_key)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#index?" do
    it "permits privileged roles" do
      expect(policy(create(:user, :super_admin)).index?).to be true
      expect(
        policy(create(:user, :review_manager, jurisdiction:)).index?
      ).to be true
      expect(
        policy(create(:user, :regional_review_manager, jurisdiction:)).index?
      ).to be true
      expect(
        policy(create(:user, :technical_support, jurisdiction:)).index?
      ).to be true
    end

    it "denies a normal user" do
      expect(policy(create(:user)).index?).to be false
    end
  end

  describe "#show?/#create?/#update?/#destroy?/#revoke?" do
    it "permits super_admin regardless of jurisdiction settings" do
      user = create(:user, :super_admin)
      expect(policy(user).show?).to be true
      expect(policy(user).create?).to be true
      expect(policy(user).update?).to be true
      expect(policy(user).destroy?).to be true
      expect(policy(user).revoke?).to be true
    end

    it "permits review staff only when member of jurisdiction and external api enabled" do
      user = create(:user, :review_manager, jurisdiction:)
      expect(policy(user).show?).to be true

      disabled_jurisdiction = create(:sub_district, external_api_state: "j_off")
      record =
        create(:external_api_key, jurisdiction: disabled_jurisdiction, sandbox:)
      expect(policy(user, record: record).show?).to be false
    end
  end

  describe "Scope" do
    it "raises for non-privileged users" do
      user = create(:user)
      expect do
        described_class::Scope.new(
          UserContext.new(user, sandbox),
          ExternalApiKey.all
        ).resolve
      end.to raise_error(Pundit::NotAuthorizedError)
    end

    it "returns all for super_admin" do
      user = create(:user, :super_admin)
      resolved =
        described_class::Scope.new(
          UserContext.new(user, sandbox),
          ExternalApiKey.all
        ).resolve
      expect(resolved).to match_array(ExternalApiKey.all)
    end

    it "returns keys for the user's jurisdictions for non-super-admin privileged users" do
      user = create(:user, :review_manager, jurisdiction:)
      k1 = create(:external_api_key, jurisdiction:, sandbox:)
      k2 =
        create(:external_api_key, jurisdiction: create(:sub_district), sandbox:)

      resolved =
        described_class::Scope.new(
          UserContext.new(user, sandbox),
          ExternalApiKey.all
        ).resolve
      expect(resolved).to include(k1)
      expect(resolved).not_to include(k2)
    end
  end
end
