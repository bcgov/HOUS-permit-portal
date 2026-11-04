# frozen_string_literal: true

require "resolv"

module RedisSentinelConfiguration
  def self.sentinels
    # SRV query: _<port-name>._<protocol>.<service>.
    # _tcp-sentinel selects the Helm port named tcp-sentinel; _tcp selects TCP.
    # SRV returns each pod's hostname and port. Pods have separate IPs, so they
    # can all use Sentinel port 26379; Redis data connections use port 6379.
    # Example production endpoints (namespace suffix omitted):
    # redis-ha-node-0.redis-ha-headless:26379
    # redis-ha-node-1.redis-ha-headless:26379
    # redis-ha-node-2.redis-ha-headless:26379
    service = "_tcp-sentinel._tcp.#{ENV.fetch("REDIS_SENTINEL_HEADLESS")}"
    records =
      Resolv::DNS.open do |dns|
        dns.getresources(service, Resolv::DNS::Resource::IN::SRV)
      end

    if records.empty?
      raise ArgumentError, "No Redis Sentinel SRV records found for #{service}"
    end

    port = ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379

    # Discover each pod's hostname, keeping IP resolution for connection time.
    records.map { |record| { host: record.target.to_s, port: port } }.uniq
  end
end
