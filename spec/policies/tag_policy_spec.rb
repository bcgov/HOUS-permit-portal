require "rails_helper"

RSpec.describe TagPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("Tag") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits index only for super_admin" do
    expect(policy(create(:user, :super_admin)).index?).to be true
    expect(policy(create(:user)).index?).to be false
  end

  it "scope returns none unless super_admin" do
    relation = double("Relation")
    none_rel = double("NoneRelation")
    joins_rel = double("JoinsRelation")
    all_rel = double("AllRelation")

    allow(relation).to receive(:none).and_return(none_rel)
    allow(relation).to receive(:joins).with(:taggings).and_return(joins_rel)
    allow(joins_rel).to receive(:all).and_return(all_rel)

    resolved =
      described_class::Scope.new(
        UserContext.new(create(:user), sandbox),
        relation
      ).resolve
    expect(resolved).to eq(none_rel)

    resolved2 =
      described_class::Scope.new(
        UserContext.new(create(:user, :super_admin), sandbox),
        relation
      ).resolve
    expect(resolved2).to eq(all_rel)
  end
end
