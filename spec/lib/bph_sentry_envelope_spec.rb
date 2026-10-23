require "sentry-ruby"
require_relative "../../lib/bph_sentry"

RSpec.describe BphSentry::PrivateEvent do
  before do
    Sentry.init do |config|
      config.dsn = "https://#{"a" * 32}@o1.ingest.us.sentry.io/1"
      config.environment = "test"
      config.transport.transport_class = Sentry::DummyTransport
      config.background_worker_threads = 0
      config.auto_session_tracking = false
      config.send_client_reports = false
      config.before_send =
        lambda do |event, _hint|
          payload = BphSentry::Privacy.payload(event)
          described_class.new(event, payload) if payload
        end
    end
  end

  after { Sentry.close }

  it "serializes a valid error envelope while preserving privacy" do
    begin
      raise ZeroDivisionError, "private-payload person@example.com"
    rescue ZeroDivisionError => exception
      Sentry.capture_exception(exception)
    end

    envelopes = Sentry.get_current_client.transport.envelopes
    expect(envelopes.length).to eq(1)
    serialized, oversized = envelopes.first.items.first.serialize
    header, payload = serialized.lines.map { |line| JSON.parse(line) }
    expect(oversized).to be(false)
    expect(header["type"]).to eq("event")
    expect(payload.dig("exception", "values", 0)).to include(
      "type" => "ZeroDivisionError",
      "value" => "[Filtered]"
    )
    expect(serialized).not_to include("private-payload", "person@example.com")
  end

  it "continues to drop plain messages" do
    Sentry.capture_message("test message")
    expect(Sentry.get_current_client.transport.envelopes).to be_empty
  end
end
