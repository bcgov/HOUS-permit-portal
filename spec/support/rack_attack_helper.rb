# spec/support/rack_attack_helper.rb
module RackAttackHelper
  def with_temporary_rate_limit(throttle_key, limit:, period:, &block)
    original_limit = Rack::Attack.throttles[throttle_key]&.limit
    original_period = Rack::Attack.throttles[throttle_key]&.period

    # Temporarily change the rate limit
    Rack::Attack.throttle(throttle_key, limit: limit, period: period) do |req|
      req.ip
    end

    block.call

    # Revert to the original configuration
    Rack::Attack.throttle(
      throttle_key,
      limit: original_limit,
      period: original_period
    ) { |req| req.ip }
    Rack::Attack.reset!
  end
end

RSpec.configure { |config| config.include RackAttackHelper }
