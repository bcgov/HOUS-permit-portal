class CHESApiWrapper
  attr_accessor :client, :bearer_token

  # In Production environments use CHES, otherwise locally use Letter Opener
  def initialize
    if Rails.env.production?
      obtain_bearer_token
      @client =
        Faraday.new(url: "#{ENV["CHES_HOST"]}/api/v1") do |conn|
          conn.headers["Content-Type"] = "application/json"
          conn.request :authorization, :bearer, @bearer_token
          conn.adapter Faraday.default_adapter
        end
    else
      @client = LetterOpener::DeliveryMethod.new
    end
  end

  def send_email(
    to:,
    from: ENV["FROM_EMAIL"],
    bcc: [],
    cc: [],
    encoding: "utf-8",
    priority: "normal",
    subject:,
    attachments: [],
    body:,
    bodyType: "html"
  )
    to = to.is_a?(Array) ? to : [to]

    # send request to CHES in deployed prod mode
    if Rails.env.production?
      ensure_ches_token_is_valid_and_health_check_passes
      params = { to:, from:, bcc:, cc:, encoding:, priority:, subject:, attachments:, body:, bodyType: }
      response = client.post("email", params.to_json)

      if response.success?
        body = JSON.parse(response.body)
        return body.dig("messages", 0, "msgId")
      end
    else
      # use letter opener in dev mode
      mail =
        Mail.new do
          to to
          from from
          subject subject

          html_part do
            content_type "text/html; charset=UTF-8"
            body body
          end
        end

      client.deliver!(mail)
    end
  end

  def email_status(msg_id)
    ensure_ches_token_is_valid_and_health_check_passes

    response = client.get("status/#{msg_id}")
    JSON.parse(response.body) if response.success?
  end

  private

  def ensure_ches_token_is_valid_and_health_check_passes
    response = client.get("health")
    return if response.success?

    if response.status == 401
      obtain_bearer_token
      ensure_ches_token_is_valid_and_health_check_passes
    else
      raise "ERROR: CHES Healthcheck failed - check with bcgov service status"
    end
  end

  def obtain_bearer_token
    auth_client =
      Faraday.new(url: ENV["CHES_AUTH_HOST"]) do |conn|
        conn.request :url_encoded
        conn.request :authorization, :basic, ENV["CHES_CLIENT_ID"], ENV["CHES_CLIENT_SECRET"]
        conn.adapter Faraday.default_adapter
      end

    response =
      auth_client.post("auth/realms/comsvcauth/protocol/openid-connect/token") do |req|
        req.body = { grant_type: "client_credentials" }
      end

    if response.success?
      body = JSON.parse(response.body)
      self.bearer_token = body["access_token"]
    else
      raise "Error: Unable to authenticate with CHES - check ENV vars"
    end
  end
end
