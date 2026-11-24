require "rails_helper"

RSpec.describe RackAttackHelper do
  it "restores the original throttle including its request filter after a failed example" do
    original = Rack::Attack.throttles.fetch("external_api/ip")
    expect do
      with_temporary_rate_limit(
        "external_api/ip",
        limit: 1,
        period: 1.second
      ) { raise "simulated failed assertion" }
    end.to raise_error("simulated failed assertion")
    expect(Rack::Attack.throttles.fetch("external_api/ip")).to equal(original)
  end
end
