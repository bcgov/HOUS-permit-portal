module AuthCookieSpecHelpers
  def with_auth_cookie_prefix(prefix)
    original_prefix = ENV["AUTH_COOKIE_PREFIX"]
    original_name = Devise::JWT::Cookie.config.name
    ENV["AUTH_COOKIE_PREFIX"] = prefix
    Devise::JWT::Cookie.config.name = AuthCookies.access_token_name
    yield
  ensure
    ENV["AUTH_COOKIE_PREFIX"] = original_prefix
    Devise::JWT::Cookie.config.name = original_name
  end
end

RSpec.configure { |config| config.include AuthCookieSpecHelpers }
