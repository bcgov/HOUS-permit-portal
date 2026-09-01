require "rails_helper"

RSpec.describe Reports::EnablementHistory do
  def event(at:, enabled:, approximate: false)
    described_class::Event.new(
      occurred_at: at,
      created_at: at,
      enabled: enabled,
      approximate: approximate
    )
  end

  let(:now) { Time.zone.parse("2026-08-28 12:00:00") }

  it "sums enabled intervals and closes the open one at now" do
    history =
      described_class.new(
        [
          event(at: now - 10.days, enabled: true),
          event(at: now - 4.days, enabled: false)
        ],
        now: now
      )

    expect(history.cumulative_days).to eq(6)
    expect(history.currently_enabled?).to eq(false)
    expect(history.churned?).to eq(true)
  end

  it "counts only enabled time toward first submission" do
    enabled_at = now - 20.days
    history =
      described_class.new(
        [
          event(at: enabled_at, enabled: true),
          event(at: now - 15.days, enabled: false),
          event(at: now - 5.days, enabled: true)
        ],
        now: now
      )

    expect(history.days_to_first_submission(now - 2.days)).to eq(8)
  end

  it "is approximate when any event was seeded or inferred" do
    history =
      described_class.new(
        [event(at: now - 1.day, enabled: true, approximate: true)],
        now: now
      )

    expect(history.approximate?).to eq(true)
  end

  it "reads enabled state and approximate comments from audits" do
    jurisdiction = create(:sub_district)
    audit =
      ApplicationAudit.create!(
        auditable: jurisdiction,
        action: "update",
        audited_changes: {
          "inbox_enabled" => [false, true]
        },
        comment: "inferred",
        created_at: now - 1.day
      )

    history = described_class.from_audits([audit], now: now)

    expect(history.first_enabled_at).to eq(audit.created_at)
    expect(history.approximate?).to eq(true)
  end
end
