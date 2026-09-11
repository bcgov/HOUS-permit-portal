require "rails_helper"

RSpec.describe Constants::ExternalApi do
  it "keeps the published dictionaries aligned with persisted enums" do
    expect(described_class::APPLICATION_STATUS_LABELS.keys).to eq(
      PermitApplication.statuses.keys
    )
    expect(described_class::PROJECT_STATE_LABELS.keys).to eq(
      PermitProject.states.keys
    )
  end

  it "limits partner writes to statuses backed by lifecycle events" do
    expect(described_class::PARTNER_WRITABLE_APPLICATION_STATUSES).to eq(
      PermitApplicationStatus::STATUS_EVENT_MAP.keys
    )
  end
end
