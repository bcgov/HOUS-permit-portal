require "rails_helper"

RSpec.describe Reports::Cache do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) do
    { "key" => "application_growth", "computed_at" => "2026-01-01T00:00:00Z" }
  end

  around do |example|
    original = Rails.cache
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    example.run
  ensure
    Rails.cache = original
  end

  it "returns the previous payload when a forced refresh fails" do
    allow(Reports::Registry).to receive(:build).and_return(
      instance_double(Reports::ApplicationGrowth, call: payload)
    )
    described_class.fetch("application_growth", range)

    allow(Reports::Registry).to receive(:build).and_raise(StandardError, "boom")

    result = described_class.fetch("application_growth", range, force: true)

    expect(result["refresh_failed"]).to eq(true)
    expect(result["computed_at"]).to eq("2026-01-01T00:00:00Z")
    expect(result["key"]).to eq("application_growth")
  end
end
