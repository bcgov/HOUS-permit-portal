# frozen_string_literal: true

# Resets Devise::JWT::Cookie.config between examples so vendored lib specs
# do not leak mutated globals into other tests.
module JwtCookieSpecHelpers
  def reset_jwt_cookie_config!
    Devise::JWT::Cookie.instance_variable_set(:@config, nil)
  end

  # Yields with a fresh Configuration; restores previous singleton after.
  def with_fresh_jwt_cookie_config
    previous = Devise::JWT::Cookie.instance_variable_get(:@config)
    Devise::JWT::Cookie.instance_variable_set(
      :@config,
      Devise::JWT::Cookie::Configuration.new
    )
    yield Devise::JWT::Cookie.config
  ensure
    Devise::JWT::Cookie.instance_variable_set(:@config, previous)
  end
end

RSpec.configure do |config|
  config.include JwtCookieSpecHelpers

  config.after(:each, :jwt_cookie_isolated) { reset_jwt_cookie_config! }
end
