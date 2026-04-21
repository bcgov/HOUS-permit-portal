require "rails_helper"

RSpec.describe RequirementBlockPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("RequirementBlock") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits all actions only for super_admin" do
    admin = create(:user, :super_admin)
    p = policy(admin)
    expect(p.show?).to be true
    expect(p.index?).to be true
    expect(p.create?).to be true
    expect(p.update?).to be true
    expect(p.destroy?).to be true
    expect(p.restore?).to be true
    expect(p.auto_compliance_module_configurations?).to be true

    normal = create(:user)
    p2 = policy(normal)
    expect(p2.show?).to be false
    expect(p2.index?).to be false
    expect(p2.create?).to be false
    expect(p2.update?).to be false
    expect(p2.destroy?).to be false
    expect(p2.restore?).to be false
    expect(p2.auto_compliance_module_configurations?).to be false
  end

  describe "Scope" do
    it "returns all for super_admin and none otherwise" do
      relation = double("Relation", all: :all, none: :none)

      admin = create(:user, :super_admin)
      resolved =
        described_class::Scope.new(
          UserContext.new(admin, sandbox),
          relation
        ).resolve
      expect(resolved).to eq(:all)

      normal = create(:user)
      resolved2 =
        described_class::Scope.new(
          UserContext.new(normal, sandbox),
          relation
        ).resolve
      expect(resolved2).to eq(:none)
    end
  end
end
