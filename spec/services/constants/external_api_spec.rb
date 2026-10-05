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

  it "lists partner statuses the machine can reach from the current status" do
    newly_submitted =
      instance_double(PermitApplication, status: "newly_submitted")
    approved = instance_double(PermitApplication, status: "approved")

    expect(described_class.available_statuses_for(newly_submitted)).to eq(
      %w[in_review withdrawn revisions_requested]
    )
    expect(described_class.available_statuses_for(approved)).to eq(
      %w[issued withdrawn]
    )
  end

  it "limits partner writes to statuses backed by lifecycle events" do
    expect(
      described_class::PARTNER_WRITABLE_APPLICATION_STATUSES
    ).to match_array(
      PermitApplicationStatus::STATUS_EVENT_MAP.keys + %w[revisions_requested]
    )
  end
end
