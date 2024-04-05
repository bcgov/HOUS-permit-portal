class ApplicationController < ActionController::Base
  if Rails.env.production?
    http_basic_authenticate_with name: "latero-test-prod", password: ENV["TEMP_BASIC_AUTH_PASSWORD"]
  end

  skip_before_action :verify_authenticity_token
end
