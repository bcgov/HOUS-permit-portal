class ChesEmailDelivery
  CHES_TIMEOUT = 30
  CHES_OPEN_TIMEOUT = 10

  attr_accessor :config, :client, :bearer_token, :delivery_method

  def initialize(config)
    @config = config

    Rails.logger.info(
      "[EMAIL HANG DEBUG] Initializing ChesEmailDelivery, CHES_HOST=#{ENV["CHES_HOST"]}"
    )
    obtain_bearer_token
    Rails.logger.info(
      "[EMAIL HANG DEBUG] Bearer token obtained: #{@bearer_token.present?}"
    )
    build_client
    Rails.logger.info(
      "[EMAIL HANG DEBUG] Faraday client built with timeout=#{CHES_TIMEOUT}s, open_timeout=#{CHES_OPEN_TIMEOUT}s"
    )
  end

  def deliver!(mail)
    Rails.logger.info(
      "[EMAIL HANG DEBUG] deliver! called for mail to=#{mail.to}"
    )
    ensure_ches_token_is_valid_and_health_check_passes
    Rails.logger.info(
      "[EMAIL HANG DEBUG] Health check passed, proceeding with delivery"
    )

    formatted_attachments = format_attachments(mail)
    body_content = extract_body_content(mail)

    params = {
      to: mail.to,
      from: mail[:from].to_s,
      bcc: mail.bcc,
      cc: mail.cc,
      encoding: "utf-8",
      priority: "normal",
      subject: mail.subject,
      attachments: formatted_attachments,
      body: body_content,
      bodyType: body_type(mail)
    }

    Rails.logger.info("[EMAIL HANG DEBUG] POSTing email to CHES API...")
    response = client.post("email", params.to_json)
    Rails.logger.info(
      "[EMAIL HANG DEBUG] POST complete, status=#{response.status}"
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

  def extract_body_content(mail)
    # For multipart emails (with attachments), extract just the HTML part
    # For simple emails, use the whole body
    if mail.multipart?
      html_part = mail.html_part || mail.text_part
      html_part&.decoded || mail.body.decoded
    else
      mail.body.to_s
    end
  end

  def format_attachments(mail)
    return [] if mail.attachments.empty?

    Rails.logger.info(
      "[CHES] Formatting #{mail.attachments.size} attachment(s)"
    )

    mail.attachments.map do |attachment|
      # Get the raw body content
      body_content = attachment.body.decoded
      encoded_content = Base64.strict_encode64(body_content)
      # Clean content type - remove any parameters like "; filename=..."
      raw_content_type = attachment.content_type.to_s
      clean_content_type = raw_content_type.split(";").first.strip

      if raw_content_type != clean_content_type
        Rails.logger.info(
          "[CHES] Cleaned content type: '#{raw_content_type}' → '#{clean_content_type}'"
        )
      end

      {
        content: encoded_content,
        contentType: clean_content_type,
        filename: attachment.filename,
        encoding: "base64" # Tell CHES content is base64 encoded
      }
    end
  end

  def ensure_ches_token_is_valid_and_health_check_passes
    Rails.logger.info(
      "[EMAIL HANG DEBUG] Starting health check GET #{ENV["CHES_HOST"]}/api/v1/health"
    )
    response = client.get("health")
    Rails.logger.info(
      "[EMAIL HANG DEBUG] Health check response status=#{response.status}"
    )

    return if response.success?

    if response.status == 401
      Rails.logger.info(
        "[EMAIL HANG DEBUG] Health check returned 401, refreshing token and rebuilding client"
      )
      obtain_bearer_token
      build_client
      ensure_ches_token_is_valid_and_health_check_passes
    else
      Rails.logger.error(
        "[CHES] Healthcheck failed - Status: #{response.status}"
      )
      raise "ERROR: CHES Healthcheck failed - check with bcgov service status"
    end
  end

  def obtain_bearer_token
    Rails.logger.info(
      "[EMAIL HANG DEBUG] Obtaining bearer token from #{ENV["CHES_AUTH_HOST"]}"
    )
    auth_client =
      Faraday.new(url: ENV["CHES_AUTH_HOST"]) do |conn|
        conn.request :url_encoded
        conn.request :authorization,
                     :basic,
                     ENV["CHES_CLIENT_ID"],
                     ENV["CHES_CLIENT_SECRET"]
        conn.options.timeout = CHES_TIMEOUT
        conn.options.open_timeout = CHES_OPEN_TIMEOUT
        conn.adapter Faraday.default_adapter
      end

    response =
      auth_client.post(
        "auth/realms/comsvcauth/protocol/openid-connect/token"
      ) { |req| req.body = { grant_type: "client_credentials" } }

    if response.success?
      body = JSON.parse(response.body)
      self.bearer_token = body["access_token"]
      Rails.logger.info("[EMAIL HANG DEBUG] Bearer token obtained successfully")
    else
      Rails.logger.error(
        "[EMAIL HANG DEBUG] Token request failed, status=#{response.status}, body=#{response.body}"
      )
      raise "Error: Unable to authenticate with CHES - check ENV vars"
    end
  end

  def build_client
    @client =
      Faraday.new(url: "#{ENV["CHES_HOST"]}/api/v1") do |conn|
        conn.headers["Content-Type"] = "application/json"
        conn.request :authorization, :bearer, @bearer_token
        conn.options.timeout = CHES_TIMEOUT
        conn.options.open_timeout = CHES_OPEN_TIMEOUT
        conn.adapter Faraday.default_adapter
      end
  end
end
