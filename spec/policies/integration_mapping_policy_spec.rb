require "rails_helper"

RSpec.describe IntegrationMappingPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
  let(:record) do
    instance_double(
      "IntegrationMapping",
      jurisdiction: jurisdiction,
      jurisdiction_id: jurisdiction.id
    )
  end

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits update for (review_manager|regional_review_manager) members when external api enabled" do
    rm = create(:user, :review_manager, jurisdiction:)
    rrm = create(:user, :regional_review_manager, jurisdiction:)
    expect(policy(rm).update?).to be true
    expect(policy(rrm).update?).to be true
  end

  it "denies update for non-members or when external api disabled" do
    stranger = create(:user, :review_manager)
    expect(policy(stranger).update?).to be false

    disabled_j = create(:sub_district, external_api_state: "j_off")
    record2 =
      instance_double(
        "IntegrationMapping",
        jurisdiction: disabled_j,
        jurisdiction_id: disabled_j.id
      )
    rm = create(:user, :review_manager, jurisdiction: disabled_j)
    expect(
      policy_for(
        described_class,
        user: rm,
        record: record2,
        sandbox: nil
      ).update?
    ).to be false
  end
end
