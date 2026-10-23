require "rails_helper"

RSpec.describe "BPH Sentry privacy and deployment guards" do
  let(:deployment) do
    {
      "SENTRY_ENVIRONMENT" => "test",
      "SENTRY_RELEASE" => "hous-permit-portal@#{"a" * 40}",
      "SENTRY_BACKEND_ENABLED" => "true",
      "SENTRY_FRONTEND_ENABLED" => "true",
      "SENTRY_FEEDBACK_ENABLED" => "true",
      "SENTRY_BACKEND_DSN" => "https://#{"a" * 32}@o1.ingest.us.sentry.io/1",
      "SENTRY_FRONTEND_DSN" => "https://#{"b" * 32}@o1.ingest.us.sentry.io/2",
      "SENTRY_AUTH_TOKEN" => "never-expose-this"
    }
  end

  it "requires production runtime configuration even when DSNs and flags are present" do
    %w[development test].each do |environment|
      config =
        BphSentry::Configuration.new(env: deployment, rails_env: environment)
      expect(config.backend_enabled?).to be(false)
      expect(config.frontend_config).to eq(
        enabled: false,
        feedbackEnabled: false
      )
    end
    config =
      BphSentry::Configuration.new(
        env: deployment.except("SENTRY_ENVIRONMENT"),
        rails_env: "production"
      )
    expect(config.backend_enabled?).to be(false)
    config =
      BphSentry::Configuration.new(
        env: deployment.merge("IS_DOCKER_BUILD" => "true"),
        rails_env: "production"
      )
    expect(config.backend_enabled?).to be(false)
  end

  it "accepts alternate deployment domains but rejects unsupported environments" do
    [nil, "alternate.example.com", "localhost"].each do |domain|
      config =
        BphSentry::Configuration.new(
          env: deployment.merge("APP_DOMAIN" => domain),
          rails_env: "production"
        )
      expect(config.backend_enabled?).to be(true)
      expect(config.frontend_config[:enabled]).to be(true)
      expect(config.frontend_config).not_to have_key(:hostname)
    end
    config =
      BphSentry::Configuration.new(
        env: deployment.merge("SENTRY_ENVIRONMENT" => "local"),
        rails_env: "production"
      )
    expect(config.backend_enabled?).to be(false)
    expect(config.frontend_config[:enabled]).to be(false)
  end

  it "exposes only public configuration and independently controls feedback and backend capture" do
    config =
      BphSentry::Configuration.new(env: deployment, rails_env: "production")
    expect(config.backend_enabled?).to be(true)
    expect(config.frontend_config[:feedbackEnabled]).to be(true)
    expect(config.frontend_config.to_json).not_to include(
      "never-expose-this",
      deployment["SENTRY_BACKEND_DSN"]
    )
    config =
      BphSentry::Configuration.new(
        env:
          deployment.merge(
            "SENTRY_FEEDBACK_ENABLED" => "false",
            "SENTRY_BACKEND_ENABLED" => "false"
          ),
        rails_env: "production"
      )
    expect(config.backend_enabled?).to be(false)
    expect(config.frontend_config).to include(
      enabled: true,
      feedbackEnabled: false
    )
  end

  it "passes release and DSN values through without format restrictions" do
    [nil, "v1.2.3"].each do |release|
      config =
        BphSentry::Configuration.new(
          env:
            deployment.merge(
              "SENTRY_RELEASE" => release,
              "SENTRY_BACKEND_DSN" => "https://public@relay.example.com/1",
              "SENTRY_FRONTEND_DSN" => "https://public@relay.example.com/2"
            ),
          rails_env: "production"
        )
      expect(config.backend_enabled?).to be(true)
      expect(config.backend_dsn).to eq("https://public@relay.example.com/1")
      expect(config.frontend_config).to include(
        enabled: true,
        release: release,
        dsn: "https://public@relay.example.com/2"
      )
    end
  end

  context "with an isolated recording SDK client" do
    before do
      Sentry.init do |config|
        config.dsn = "https://#{"a" * 32}@o1.ingest.us.sentry.io/1"
        config.environment = "test"
        config.release = deployment["SENTRY_RELEASE"]
        config.transport.transport_class = Sentry::DummyTransport
        config.background_worker_threads = 0
        config.auto_session_tracking = false
        config.send_client_reports = false
        config.breadcrumbs_logger = []
        config.before_send =
          lambda do |event, _hint|
            payload = BphSentry::Privacy.payload(event)
            BphSentry::PrivateEvent.new(event, payload) if payload
          end
      end
    end
    after { Sentry.close }

    def capture(contexts: {})
      begin
        raise ArgumentError, "person@example.com password=private-payload"
      rescue => error
        Sentry.capture_exception(
          error,
          contexts: contexts,
          extra: {
            answers: "private-payload"
          }
        )
      end
      Sentry.get_current_client.transport.envelopes.last.items.first.payload
    end

    it "serializes an allowlist rather than leaking payloads, exception messages or frame variables" do
      Sentry.set_user(
        id: "12345678-1234-1234-1234-123456789abc",
        email: "person@example.com",
        ip_address: "127.0.0.1"
      )
      Sentry.set_tags(
        component: "web",
        role: "reviewer",
        route: "api/permit_applications#show",
        token: "private-payload"
      )
      result = capture
      json = result.to_json
      expect(json).not_to include(
        "person@example.com",
        "private-payload",
        "127.0.0.1",
        "pre_context",
        "post_context",
        "context_line"
      )
      expect(result.dig(:exception, :values, 0, :type)).to eq("ArgumentError")
      expect(result[:user]).to eq(id: "12345678-1234-1234-1234-123456789abc")
      expect(result[:tags]).to include(
        role: "reviewer",
        route: "api/permit_applications#show"
      )
    end

    it "removes inherited identities and arguments from worker events" do
      Sentry.set_user(id: "12345678-1234-1234-1234-123456789abc")
      Sentry.set_tags(
        component: "web",
        role: "reviewer",
        route: "api/users#show"
      )
      result =
        capture(
          contexts: {
            sidekiq: {
              "class" => "PdfGenerationJob",
              "args" => ["private-payload"]
            }
          }
        )
      expect(result[:user]).to eq({})
      expect(result[:tags]).to eq(
        component: "worker",
        job_class: "PdfGenerationJob"
      )
    end

    it "preserves Sidekiq failure propagation and reports once without job arguments or inherited users" do
      Sentry.configuration.data_collection.user_info = false
      Sentry.configuration.sidekiq.propagate_traces = false
      Sentry.set_user(id: "12345678-1234-1234-1234-123456789abc")
      Sentry.set_tags(component: "web", role: "reviewer")
      job = {
        "class" => "PdfGenerationJob",
        "jid" => "synthetic",
        "args" => ["private-payload"],
        "retry" => 3
      }
      Sentry::Sidekiq::SentryContextClientMiddleware
        .new
        .call("PdfGenerationJob", job, "default", nil) {}
      expect(job).not_to have_key("sentry_user")
      expect(job).not_to have_key("trace_propagation_headers")
      failure = ArgumentError.new("private-payload")
      expect do
        Sentry::Sidekiq::SentryContextServerMiddleware
          .new
          .call(Object.new, job, "default") { raise failure }
      end.to raise_error(failure)
      expect(Sentry.get_current_client.transport.envelopes).to be_empty
      Sentry::Sidekiq::ErrorHandler.new.call(failure, { job: job })
      events = Sentry.get_current_client.transport.envelopes
      expect(events.length).to eq(1)
      result = events.first.items.first.payload
      expect(result[:tags]).to eq(
        component: "worker",
        job_class: "PdfGenerationJob"
      )
      expect(result[:user]).to eq({})
      expect(result.to_json).not_to include(
        "private-payload",
        "args",
        "reviewer"
      )
      expect(Sentry.get_current_scope.user).to eq({})
      expect(job["retry"]).to eq(3)
    end

    it "drops messages and unsupported events" do
      Sentry.capture_message("private-payload")
      expect(Sentry.get_current_client.transport.envelopes).to be_empty
    end

    it "loads the enabled production initializer with recording delivery and disables IP inference" do
      settings =
        BphSentry::Configuration.new(env: deployment, rails_env: "production")
      allow(BphSentry::Configuration).to receive(:new).and_return(settings)
      allow(Sentry).to receive(
        :init
      ).and_wrap_original do |original, &configure|
        original.call do |config|
          configure.call(config)
          config.transport.transport_class = Sentry::DummyTransport
          config.background_worker_threads = 0
        end
      end
      load Rails.root.join("config/initializers/sentry.rb")
      Sentry.set_user(id: "12345678-1234-1234-1234-123456789abc")
      result = capture
      expect(result[:user]).to eq(id: "12345678-1234-1234-1234-123456789abc")
      expect(Sentry.configuration.data_collection.user_info).to be(false)
      expect(Sentry.configuration.sidekiq.propagate_traces).to be(false)
    end

    it "assigns process components on fresh threads using the framework startup callbacks" do
      settings =
        BphSentry::Configuration.new(env: deployment, rails_env: "production")
      allow(BphSentry::Configuration).to receive(:new).and_return(settings)
      allow(Sentry).to receive(
        :init
      ).and_wrap_original do |original, &configure|
        original.call do |config|
          configure.call(config)
          config.transport.transport_class = Sentry::DummyTransport
          config.background_worker_threads = 0
        end
      end
      rpc_start = nil
      allow(AnyCable).to receive(:configure_server) { |&callback|
        rpc_start = callback
      }

      %w[web worker anycable-rpc].each do |component|
        allow(Sidekiq).to receive(:server?).and_return(component == "worker")
        load Rails.root.join("config/initializers/sentry.rb")
        rpc_start.call if component == "anycable-rpc"
        result =
          Thread
            .new do
              Sentry.set_user(id: "12345678-1234-1234-1234-123456789abc")
              Sentry.set_tags(component: "web", role: "reviewer")
              capture
            end
            .value
        expect(result[:tags][:component]).to eq(component)
        expect(result[:user]).to eq({}) unless component == "web"
        Sentry.close
      end
    end

    it "captures once through request middleware and isolates user scopes between requests" do
      actor = "12345678-1234-1234-1234-123456789abc"
      app =
        lambda do |env|
          Sentry.set_user(env["synthetic.actor"] ? { id: actor } : {})
          Sentry.set_tags(
            component: "web",
            role: env["synthetic.actor"] ? "reviewer" : nil
          )
          raise ArgumentError, "private-payload"
        end
      middleware = Sentry::Rack::CaptureExceptions.new(app)
      [true, false].each do |authenticated|
        env =
          Rack::MockRequest.env_for(
            "/applications/private-payload?token=private-payload"
          )
        env["synthetic.actor"] = authenticated
        expect { middleware.call(env) }.to raise_error(ArgumentError)
        expect(Sentry.get_current_scope.user).to eq({})
      end
      events =
        Sentry.get_current_client.transport.envelopes.map do |envelope|
          envelope.items.first.payload
        end
      expect(events.length).to eq(2)
      expect(events.first[:user]).to eq(id: actor)
      expect(events.last[:user]).to eq({})
      expect(events.to_json).not_to include("private-payload")
    end
  end

  it "reports supplied exceptions only for unexpected 5xx helper responses" do
    controller = Api::ApplicationController.new
    allow(controller).to receive(:render)
    allow(Rails.logger).to receive(:error)
    allow(BphSentry).to receive(:capture_exception)
    error = StandardError.new("synthetic")
    [400, 401, 403, 404, 422].each do |status|
      controller.render_error(nil, { status: status }, error)
    end
    expect(BphSentry).not_to have_received(:capture_exception)
    controller.render_error(nil, { status: :internal_server_error }, error)
    expect(BphSentry).to have_received(:capture_exception).with(error).once
  end
end
