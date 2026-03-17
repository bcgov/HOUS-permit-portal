require "rails_helper"

RSpec.describe RegionalDistrictPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }

  it "inherits from JurisdictionPolicy" do
    expect(described_class < JurisdictionPolicy).to be true
  end

  it "scope returns all" do
    relation = double("Relation", all: :all)
    resolved =
      described_class::Scope.new(
        UserContext.new(user, sandbox),
        relation
      ).resolve
    expect(resolved).to eq(:all)
  end
end
