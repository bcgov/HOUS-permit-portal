module RackAttackHelper
  def with_temporary_rate_limit(throttle_key, limit:, period:)
    original = Rack::Attack.throttles[throttle_key]
    Rack::Attack.throttle(
      throttle_key,
      limit: limit,
      period: period
    ) { |request| request.ip }
    yield
  ensure
    if original
      Rack::Attack.throttles[throttle_key] = original
    else
      Rack::Attack.throttles.delete(throttle_key)
    end
    Rack::Attack.reset!
  end
end

RSpec.configure do |config|
  config.include RackAttackHelper
  config.before(:each, type: :request) { Rack::Attack.reset! }
end
