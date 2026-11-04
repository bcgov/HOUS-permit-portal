# frozen_string_literal: true

require "anycable/config"
require "redis"
require "sidekiq/redis_client_adapter"
require_relative "../../lib/redis_sentinel_configuration"

RSpec.describe RedisSentinelConfiguration do
  let(:service) { "redis-ha-headless.invalid" }
  let(:hostnames) { ["redis-ha-node-0.#{service}"] }
  let(:sentinel_env) { { "REDIS_SENTINEL_HEADLESS" => service } }
  let(:dns) { instance_double(Resolv::DNS) }
  let(:records) do
    hostnames.map do |hostname|
      Resolv::DNS::Resource::IN::SRV.new(
        0,
        100,
        26_379,
        Resolv::DNS::Name.create(hostname)
      )
    end
  end

  before do
    stub_const("RedisSentinelConfiguration::ENV", sentinel_env)
    allow(Resolv::DNS).to receive(:open).and_yield(dns)
    allow(dns).to receive(:getresources).with(
      "_tcp-sentinel._tcp.#{service}",
      Resolv::DNS::Resource::IN::SRV
    ).and_return(records)
  end

  it "discovers a single pod's hostname and uses the default Sentinel port" do
    expect(described_class.sentinels).to eq(
      [{ host: hostnames.first, port: 26_379 }]
    )
  end

  it "uses the configured Sentinel port" do
    sentinel_env["REDIS_SENTINEL_PORT"] = "26380"

    expect(described_class.sentinels).to eq(
      [{ host: hostnames.first, port: 26_380 }]
    )
  end

  it "fails clearly when discovery returns no pods" do
    allow(dns).to receive(:getresources).and_return([])

    expect { described_class.sentinels }.to raise_error(
      ArgumentError,
      "No Redis Sentinel SRV records found for _tcp-sentinel._tcp.#{service}"
    )
  end

  it "propagates DNS timeouts instead of silently reducing the Sentinel list" do
    allow(dns).to receive(:getresources).and_raise(Resolv::ResolvTimeout)

    expect { described_class.sentinels }.to raise_error(Resolv::ResolvTimeout)
  end

  context "with multiple Sentinel pods" do
    let(:hostnames) { (0..2).map { |i| "redis-ha-node-#{i}.#{service}" } }

    it "keeps a separate hostname entry for each pod" do
      expect(described_class.sentinels).to eq(
        hostnames.map { |host| { host: host, port: 26_379 } }
      )
    end

    it "does not duplicate pods when DNS returns duplicate records" do
      allow(dns).to receive(:getresources).and_return(records + records)

      expect(described_class.sentinels.size).to eq(3)
    end

    it "passes every hostname through Sidekiq's Redis adapter" do
      adapter =
        Sidekiq::RedisClientAdapter.new(
          name: "redisMasterSet",
          sentinels: described_class.sentinels
        )

      expect(adapter.new_client.config.sentinels.map(&:host)).to eq(hostnames)
    end

    it "passes every hostname through AnyCable and redis-rb" do
      config =
        AnyCable::Config.new(
          redis_url: "redis://redisMasterSet/1",
          redis_sentinels: described_class.sentinels
        )
      redis = Redis.new(**config.to_redis_params)

      expect(redis._client.config.sentinels.map(&:host)).to eq(hostnames)
    end
  end
end
