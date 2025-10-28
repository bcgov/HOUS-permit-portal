class ChesEmailDelivery
  attr_accessor :config, :client, :bearer_token, :delivery_method

  def initialize(config)
    @config = config

    obtain_bearer_token
    @client =
      Faraday.new(url: "#{ENV["CHES_HOST"]}/api/v1") do |conn|
        conn.headers["Content-Type"] = "application/json"
        conn.request :authorization, :bearer, @bearer_token
        conn.adapter Faraday.default_adapter
      end
  end

  def deliver!(mail)
    masked_recipients = mail.to&.map { |email| "#{email[0..3]}..." }&.join(", ")
    Rails.logger.info(
      "[CHES] Starting email delivery - " \
        "To: #{masked_recipients}, " \
        "Subject: #{mail.subject}, " \
        "Attachments: #{mail.attachments.size}"
    )

    ensure_ches_token_is_valid_and_health_check_passes

    formatted_attachments = format_attachments(mail)
    Rails.logger.info(
      "[CHES] Formatted #{formatted_attachments.size} attachments for CHES"
    )

    params = {
      to: mail.to,
      from: mail[:from].to_s,
      bcc: mail.bcc,
      cc: mail.cc,
      encoding: "utf-8",
      priority: "normal",
      subject: mail.subject,
      attachments: formatted_attachments,
      body: mail.body.to_s,
      bodyType: body_type(mail)
    }

    Rails.logger.info("[CHES] Posting to CHES API...")
    Rails.logger.debug(
      "[CHES] Payload: #{params.except(:body, :attachments).inspect}"
    )

    response = client.post("email", params.to_json)

    Rails.logger.info(
      "[CHES] CHES Response - Status: #{response.status}, Success: #{response.success?}"
    )

    if response.success?
      body = JSON.parse(response.body)
      msg_id = body.dig("messages", 0, "msgId")
      Rails.logger.info("[CHES] Email sent successfully! Message ID: #{msg_id}")
      return msg_id
    else
      Rails.logger.error(
        "[CHES] CHES API Error - Status: #{response.status}, Body: #{response.body}"
      )
      nil
    end
  rescue => e
    Rails.logger.error(
      "[CHES] Exception during email delivery: #{e.class.name} - #{e.message}\n#{e.backtrace.first(5).join("\n")}"
    )
    raise
  end

  def body_type(mail)
    case mail.content_type
    when mail.content_type.include?("text/html")
      "html"
    when mail.content_type.include?("text/plain")
      "text"
    else
      "html"
    end
  end

  def email_status(msg_id)
    ensure_ches_token_is_valid_and_health_check_passes

    response = client.get("status/#{msg_id}")
    JSON.parse(response.body) if response.success?
  end

  private

  def format_attachments(mail)
    return [] if mail.attachments.empty?

    Rails.logger.info(
      "[CHES] Formatting #{mail.attachments.size} attachment(s)"
    )

    mail.attachments.map do |attachment|
      decoded_size = attachment.body.decoded.bytesize
      encoded_size = Base64.strict_encode64(attachment.body.decoded).bytesize

      Rails.logger.info(
        "[CHES] Attachment - " \
          "Name: #{attachment.filename}, " \
          "Type: #{attachment.content_type}, " \
          "Decoded: #{decoded_size} bytes, " \
          "Encoded: #{encoded_size} bytes"
      )

      {
        content: Base64.strict_encode64(attachment.body.decoded),
        contentType: attachment.content_type,
        filename: attachment.filename,
        encoding: "base64"
      }
    end
  end

  def ensure_ches_token_is_valid_and_health_check_passes
    response = client.get("health")

    if response.success?
      Rails.logger.debug("[CHES] Health check passed")
      return
    end

    Rails.logger.warn("[CHES] Health check failed - Status: #{response.status}")

    if response.status == 401
      Rails.logger.info("[CHES] Refreshing bearer token...")
      obtain_bearer_token
      ensure_ches_token_is_valid_and_health_check_passes
    else
      Rails.logger.error(
        "[CHES] CHES Healthcheck failed - Status: #{response.status}, Body: #{response.body}"
      )
      raise "ERROR: CHES Healthcheck failed - check with bcgov service status"
    end
  end

  def obtain_bearer_token
    auth_client =
      Faraday.new(url: ENV["CHES_AUTH_HOST"]) do |conn|
        conn.request :url_encoded
        conn.request :authorization,
                     :basic,
                     ENV["CHES_CLIENT_ID"],
                     ENV["CHES_CLIENT_SECRET"]
        conn.adapter Faraday.default_adapter
      end

    response =
      auth_client.post(
        "auth/realms/comsvcauth/protocol/openid-connect/token"
      ) { |req| req.body = { grant_type: "client_credentials" } }

    if response.success?
      body = JSON.parse(response.body)
      self.bearer_token = body["access_token"]
    else
      raise "Error: Unable to authenticate with CHES - check ENV vars"
    end
  end
end
