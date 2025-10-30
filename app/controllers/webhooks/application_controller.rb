class Webhooks::ApplicationController < ActionController::API
  # Skip CSRF protection for all webhooks (API-only, no session)
  skip_before_action :verify_authenticity_token, raise: false

  # Common webhook error handling
  rescue_from JSON::ParserError, with: :handle_invalid_json
  rescue_from StandardError, with: :handle_processing_error

  private

  def handle_invalid_json(exception)
    Rails.logger.error("Webhook JSON parse error: #{exception.message}")
    render json: { error: "Invalid JSON payload" }, status: :bad_request
  end

  def handle_processing_error(exception)
    Rails.logger.error("Webhook processing error: #{exception.message}")
    Rails.logger.error(exception.backtrace.join("\n"))
    render json: {
             error: "Internal server error"
           },
           status: :internal_server_error
  end

  # Helper to log webhook metadata
  def log_webhook_metadata(provider_name)
    metadata = {
      provider: provider_name,
      request_id: request.headers["X-Request-ID"],
      webhook_version: request.headers["X-Webhook-Version"],
      user_agent: request.headers["User-Agent"],
      timestamp: request.headers["X-Timestamp"],
      retry_count: request.headers["X-Retry-Count"],
      remote_ip: request.remote_ip
    }.compact

    Rails.logger.info("Webhook received: #{metadata}")
    metadata
  end

  # Helper to validate JSON content type
  def validate_json_content_type!
    unless request.content_type&.include?("application/json")
      Rails.logger.warn(
        "Webhook received with invalid content type: #{request.content_type}"
      )
      render json: { error: "Invalid content type" }, status: :bad_request
      return false
    end
    true
  end
end
