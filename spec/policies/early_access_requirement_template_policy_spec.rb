require "rails_helper"

RSpec.describe EarlyAccessRequirementTemplatePolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user, :super_admin) }
  let(:record) { double("RequirementTemplate") }

  describe "#resolve" do
    it "filters to EarlyAccessRequirementTemplate type" do
      scope_relation = instance_double("ActiveRecord::Relation")
      expect(scope_relation).to receive(:where).with(
        type: EarlyAccessRequirementTemplate.name
      ).and_return(:filtered)

      policy = policy_for(described_class, user:, record:, sandbox:)
      policy.define_singleton_method(:scope) { scope_relation }

      expect(policy.resolve).to eq(:filtered)
    end
  end
end
