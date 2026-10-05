class Webhooks::DevController < Webhooks::ApplicationController
  # ponytail: process-local ring buffer. Fine for single-process `rails s`;
  # switch to tmp/ or Redis if you run multiple Puma workers.
  MAX_EVENTS = 50
  @events = []
  @mutex = Mutex.new

  class << self
    attr_accessor :events, :mutex
  end

  def receive
    body = parsed_body
    event = {
      received_at: Time.current.iso8601(3),
      content_type: request.content_type,
      signature: request.headers[Constants::Webhooks::WEBHOOK_SIGNATURE_HEADER],
      body: body
    }
    store(event)
    Rails.logger.info("[dev webhook] #{event.to_json}")
    render json: { ok: true }, status: :ok
  end

  def index
    render json: { events: self.class.events }
  end

  private

  def parsed_body
    raw = request.raw_post
    return if raw.blank?

    JSON.parse(raw)
  rescue JSON::ParserError
    raw
  end

  def store(event)
    self.class.mutex.synchronize do
      self.class.events.unshift(event)
      self.class.events.pop while self.class.events.size > MAX_EVENTS
    end
  end
end
