# frozen_string_literal: true

require "resolv"

module RedisSentinelConfiguration
  def self.sentinels
    # Bitnami and CloudPirates publish the same port with different SRV names.
    port_name = ENV.fetch("REDIS_SENTINEL_SERVICE_PORT_NAME", "tcp-sentinel")
    service = "_#{port_name}._tcp.#{ENV.fetch("REDIS_SENTINEL_HEADLESS")}"
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
