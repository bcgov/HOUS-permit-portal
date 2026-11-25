# frozen_string_literal: true

module AuthCookies
  def self.access_token_name
    "#{ENV.fetch("AUTH_COOKIE_PREFIX", "")}access_token"
  end

  def self.id_token_name
    "#{ENV.fetch("AUTH_COOKIE_PREFIX", "")}id_token"
  end
end
