require "rails_helper"

RSpec.describe GeocoderPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { nil }
  let(:record) { double("Geocoder") }

  subject(:policy) { policy_for(described_class, user:, record:, sandbox:) }

  it "permits read-only endpoints without auth" do
    expect(policy.jurisdiction?).to be true
    expect(policy.site_options?).to be true
    expect(policy.pid?).to be true
    expect(policy.pin?).to be true
    expect(policy.pid_details?).to be true
    expect(policy.form_bc_addresses?).to be true
  end
end
