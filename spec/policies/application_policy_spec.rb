require "rails_helper"

RSpec.describe ApplicationPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("Record") }
  let(:user) { create(:user) }

  subject(:policy) do
    described_class.new(UserContext.new(user, sandbox), record)
  end

  it "defaults to false for standard actions" do
    expect(policy.index?).to be false
    expect(policy.show?).to be false
    expect(policy.create?).to be false
    expect(policy.new?).to be false
    expect(policy.update?).to be false
    expect(policy.edit?).to be false
    expect(policy.destroy?).to be false
  end

  it "scope resolves to all" do
    scope = class_double("SomeModel", all: :all_records)
    resolved =
      described_class::Scope.new(UserContext.new(user, sandbox), scope).resolve
    expect(resolved).to eq(:all_records)
  end
end
