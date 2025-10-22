class Webhooks::ArchistarController < Webhooks::ApplicationController
  before_action :authenticate_webhook
  before_action :validate_json_content_type!, only: [:receive]

  # POST /webhooks/archistar
  def receive
    # Log webhook metadata
    log_webhook_metadata("Archistar")

    # Log the raw request body for debugging
    raw_body = request.body.read
    Rails.logger.info("Archistar webhook raw payload: #{raw_body}")
    request.body.rewind

    # Parse and process the webhook
    begin
      payload = JSON.parse(raw_body)
      Rails.logger.info("Archistar webhook parsed payload: #{payload}")

      process_webhook(payload)

      render json: {
               status: "success",
               message: "Webhook processed successfully"
             },
             status: :ok
    rescue JSON::ParserError => e
      Rails.logger.error("Webhook JSON parse error: #{e.message}")
      render json: { error: "Invalid JSON payload" }, status: :bad_request
    end
  end

  private

  def authenticate_webhook
    # API Key authentication
    api_key = request.headers["X-Archistar-API-Key"]
    expected_api_key = ENV["ARCHISTAR_WEBHOOK_SECRET"]

    if expected_api_key.present? && api_key != expected_api_key
      Rails.logger.warn(
        "Archistar webhook authentication failed: Invalid API key"
      )
      render json: { error: "Unauthorized" }, status: :unauthorized
      return
    end

    # IP whitelist (optional additional security)
    validate_ip_whitelist if ENV["ARCHISTAR_WEBHOOK_IP_WHITELIST"].present?
  end

  def validate_ip_whitelist
    allowed_ips = ENV["ARCHISTAR_WEBHOOK_IP_WHITELIST"].split(",").map(&:strip)
    # Always allow 0.0.0.0 for testing/development
    allowed_ips << "0.0.0.0" if Rails.env.test? || Rails.env.development?
    client_ip = request.remote_ip

    unless allowed_ips.include?(client_ip)
      Rails.logger.warn(
        "Archistar webhook authentication failed: IP not whitelisted: #{client_ip}"
      )
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  # TODO: Future enhancement - HMAC signature verification
  # When Archistar supports dynamic signature generation, implement:
  # def verify_hmac_signature
  #   return true unless ENV["ARCHISTAR_WEBHOOK_SECRET"].present?
  #
  #   signature = request.headers["X-Archistar-Signature"]
  #   secret = ENV["ARCHISTAR_WEBHOOK_SECRET"]
  #   expected_signature = "sha256=#{OpenSSL::HMAC.hexdigest("SHA256", secret, request.raw_post)}"
  #
  #   ActiveSupport::SecurityUtils.secure_compare(signature.to_s, expected_signature)
  # end

  def process_webhook(payload)
    certificate_no = payload["certificate_no"]

    unless certificate_no.present?
      Rails.logger.warn(
        "No certificate number found in Archistar webhook payload"
      )
      return
    end

    pre_check = PreCheck.find_by(certificate_no: certificate_no)

    if pre_check
      update_pre_check_from_webhook(pre_check, payload)
    else
      Rails.logger.warn(
        "No pre-check found for certificate number: #{certificate_no}"
      )
    end
  end

  def update_pre_check_from_webhook(pre_check, payload)
    # Update pre_check with Archistar response data (except assessment_result)
    # Obtain the viewer url from Archistar
    viewer_url =
      Wrappers::Archistar.new.get_submission_viewer_url(
        pre_check.certificate_no
      )
    update_params = {
      completed_at: payload["completed_at"],
      result_message: payload["message"],
      viewer_url: viewer_url
    }

    # NOTE: Additional metadata available in payload but not currently stored:
    # - payload["metadata"]: { certificate, address, lot_id, council, zone, masterplan_name, masterplan_version }
    # - payload["applicant"]: { name, email }
    # - payload["documents"]: [{ documentName, type, uploadedDateTime, documentURL }]
    #   - Report types: "report", "summary_report"
    #   - Document URLs require authentication to download
    # - payload["submission_status"], payload["external_status"]
    # - payload["scope"]: (e.g., "uat", "prod")
    # - payload["created_at"]: Submission timestamp (stored as submitted_at)
    #
    # To store this data later, add to archistar_metadata jsonb field

    pre_check.update!(update_params)
    Rails.logger.info("Updated pre-check #{pre_check.id} with Archistar data")

    # Update status based on webhook status
    status = payload["status"]&.downcase
    assessment_result = payload["assessment_result"]&.downcase

    case status
    when "complete"
      if pre_check.processing?
        # Pass assessment_result to mark_complete! event
        if assessment_result == "passed"
          pre_check.mark_complete!(:passed)
          Rails.logger.info(
            "Marked pre-check #{pre_check.id} as complete (assessment: passed)"
          )
          NotificationService.publish_pre_check_completed_event(pre_check)
        elsif assessment_result == "failed"
          pre_check.mark_complete!(:failed)
          Rails.logger.warn(
            "Marked pre-check #{pre_check.id} as complete (assessment: failed)"
          )
          NotificationService.publish_pre_check_completed_event(pre_check)
        else
          Rails.logger.warn(
            "Unknown assessment result: #{payload["assessment_result"]}"
          )
        end
      else
        Rails.logger.info(
          "Pre-check #{pre_check.id} already in #{pre_check.status} state"
        )
      end
    when "failed", "error"
      Rails.logger.error(
        "Archistar submission failed for pre-check #{pre_check.id}: #{payload["message"]}"
      )
      # TODO: Add failed status handling if needed
    when "processing", "in_progress"
      Rails.logger.info("Pre-check #{pre_check.id} is still processing")
    else
      Rails.logger.warn("Unknown Archistar webhook status: #{status}")
    end
  end
end
