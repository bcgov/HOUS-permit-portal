require "rails_helper"

RSpec.describe ExternalApi::ApplicationPolicy, type: :policy do
  let(:record) { double("Record") }
  let(:external_api_key) { instance_double("ExternalApiKey", sandbox: nil) }

  subject(:policy) { described_class.new(external_api_key, record) }

  it "defaults to false for standard actions" do
    expect(policy.index?).to be false
    expect(policy.show?).to be false
    expect(policy.create?).to be false
    expect(policy.new?).to be false
    expect(policy.update?).to be false
    expect(policy.edit?).to be false
    expect(policy.destroy?).to be false
  end

  it "resolves scope to all by default" do
    scope = class_double("PermitApplication", all: :all_records)
    resolved = described_class::Scope.new(external_api_key, scope).resolve
    expect(resolved).to eq(:all_records)
  end
end
