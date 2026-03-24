require "rails_helper"

RSpec.describe ExternalApi::PermitApplicationPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }
  let(:external_api_key) { create(:external_api_key, jurisdiction:, sandbox:) }

  def policy(record)
    external_api_policy_for(
      described_class,
      external_api_key: external_api_key,
      record:
    )
  end

  describe "#index?/#show?" do
    it "permits when jurisdiction matches, record is submitted, and sandbox matches" do
      record =
        instance_double(
          "PermitApplication",
          jurisdiction: jurisdiction,
          submitted?: true,
          sandbox: sandbox
        )
      expect(policy(record).index?).to be true
      expect(policy(record).show?).to be true
    end

    it "denies when record is not submitted" do
      record =
        instance_double(
          "PermitApplication",
          jurisdiction: jurisdiction,
          submitted?: false,
          sandbox: sandbox
        )
      expect(policy(record).index?).to be false
    end

    it "denies when jurisdiction differs" do
      record =
        instance_double(
          "PermitApplication",
          jurisdiction: create(:sub_district),
          submitted?: true,
          sandbox: sandbox
        )
      expect(policy(record).index?).to be false
    end
  end

  describe "#show_integration_mapping?" do
    it "permits when jurisdiction matches (submitted state not required)" do
      record = instance_double("PermitApplication", jurisdiction: jurisdiction)
      expect(policy(record).show_integration_mapping?).to be true
    end

    it "denies when jurisdiction differs" do
      record =
        instance_double(
          "PermitApplication",
          jurisdiction: create(:sub_district)
        )
      expect(policy(record).show_integration_mapping?).to be false
    end
  end

  describe "Scope" do
    it "filters to submitter and sandbox (via stubbed methods)" do
      relation = instance_double("ActiveRecord::Relation")
      expect(relation).to receive(:where).with(
        submitter: :some_submitter,
        sandbox: sandbox
      ).and_return(:filtered)

      scope = described_class::Scope.new(external_api_key, relation)
      scope.define_singleton_method(:user) { :some_submitter }
      sandbox_value = sandbox
      scope.define_singleton_method(:sandbox) { sandbox_value }

      expect(scope.resolve).to eq(:filtered)
    end
  end
end
