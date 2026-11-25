require "sentry-ruby"
require "rack"
require_relative "../../lib/bph_sentry"

RSpec.describe "Native Sentry privacy scrubbing" do
  before do
    Sentry.init do |config|
      config.dsn = "https://#{"a" * 32}@o1.ingest.us.sentry.io/1"
      config.environment = "test"
      config.transport.transport_class = Sentry::DummyTransport
      config.background_worker_threads = 0
      config.auto_session_tracking = false
      config.send_client_reports = false
      config.before_send = ->(event, _hint) { BphSentry::Privacy.scrub(event) }
    end
    Sentry.set_tags(component: "web")
  end
  after { Sentry.close }

  def capture(message, contexts: {})
    begin
      raise ArgumentError, message
    rescue ArgumentError => exception
      Sentry.capture_exception(exception, contexts: contexts)
    end
    Sentry.get_current_client.transport.envelopes.last
  end

  it "keeps native exception structure, mechanisms and stack locations in a valid envelope" do
    envelope = capture("Cannot render unsupported template version")
    serialized, oversized = envelope.items.first.serialize
    header, payload = serialized.lines.map { |line| JSON.parse(line) }
    expect(header["type"]).to eq("event")
    expect(oversized).to be(false)
    exception = payload.dig("exception", "values", 0)
    expect(exception["value"]).to include(
      "Cannot render unsupported template version"
    )
    expect(exception.dig("mechanism", "handled")).to be(true)
    expect(exception.dig("stacktrace", "frames").last["filename"]).not_to eq(
      "[external]"
    )
    expect(exception.dig("stacktrace", "frames").last["function"]).to include(
      "capture"
    )
    expect(payload.dig("sdk", "name")).to eq("sentry.ruby")
    expect(payload.dig("sdk", "settings", "infer_ip")).to eq("never")
  end

  it "removes known names, emails and secrets without replacing the whole message" do
    Sentry.set_context(
      "privacy",
      { names: ["Quinn", "Redwood", "Quinn Redwood"] }
    )
    Sentry.set_user(
      id: "12345678-1234-1234-1234-123456789abc",
      email: "person@example.com",
      name: "Quinn Redwood"
    )
    Sentry.set_tags(token: "private-token")
    serialized =
      capture(
        'Cannot deliver to Quinn Redwood, person@example.com; password="private-secret"'
      ).items.first.serialize.first
    expect(serialized).to include(
      "Cannot deliver to",
      "[Filtered name]",
      "[Filtered email]"
    )
    expect(serialized).not_to include(
      "Quinn",
      "Redwood",
      "person@example.com",
      "private-secret",
      "private-token",
      '"privacy"'
    )
  end

  it "keeps SQL identifiers and placeholders while removing literals and row values" do
    message =
      "ERROR: column users.review_reminder does not exist\nSELECT \"email\" FROM users WHERE customer_name = 'Quinn Redwood' AND email = $1\nDETAIL: Key (name)=(Other Person)"
    clean = BphSentry::Privacy.scrub_text(message)
    expect(clean).to include(
      "users.review_reminder",
      'SELECT "email" FROM users',
      "email = $1",
      "'[Filtered]'"
    )
    expect(clean).not_to include("Quinn Redwood", "Other Person")
    expect(
      BphSentry::Privacy.scrub_text(
        "SELECT name FROM users WHERE name = $1 AND email = ?"
      )
    ).to eq("SELECT name FROM users WHERE name = $1 AND email = ?")
  end

  it "removes private containers while keeping runtime context and isolating worker identities" do
    event =
      Sentry.get_current_client.event_from_exception(
        ArgumentError.new("Useful message")
      )
    event.tags = {
      component: "worker",
      role: "reviewer",
      route: "api/users#show"
    }
    event.user = { id: "private-user", email: "person@example.com" }
    event.extra = { answers: "private-payload" }
    event.rack_env =
      Rack::MockRequest.env_for(
        "/users/private-payload?token=private-payload",
        "HTTP_COOKIE" => "private-payload"
      )
    event.contexts = {
      runtime: {
        name: "ruby",
        version: "4.0.9"
      },
      sidekiq: {
        "class" => "ReminderJob",
        "args" => ["private-payload"]
      }
    }
    payload = BphSentry::Privacy.scrub(event).to_h
    expect(payload[:user]).to eq({})
    expect(payload[:tags]).to eq(component: "worker", job_class: "ReminderJob")
    expect(payload.dig(:contexts, :runtime, :version)).to eq("4.0.9")
    expect(payload.to_json).not_to include(
      "private-payload",
      "private-user",
      "person@example.com"
    )
  end

  it "preserves a native chained exception without introducing empty stack arrays" do
    begin
      begin
        raise "original cause"
      rescue StandardError
        raise ArgumentError, "wrapper"
      end
    rescue ArgumentError => exception
      Sentry.capture_exception(exception)
    end
    values =
      Sentry
        .get_current_client
        .transport
        .envelopes
        .last
        .items
        .first
        .payload
        .dig(:exception, :values)
    expect(values.length).to eq(2)
    expect(values.first[:value]).to include("original cause")
    expect(values.last[:value]).to include("wrapper")
    expect(values).to all(
      satisfy do |value|
        !value[:stacktrace] || value.dig(:stacktrace, :frames).any?
      end
    )
  end

  it "continues to drop plain messages" do
    Sentry.capture_message("test message")
    expect(Sentry.get_current_client.transport.envelopes).to be_empty
  end
end
