# frozen_string_literal: true

require "faraday"
require "faraday/multipart"
require "tempfile"

# Converts a printer-friendly HTML URL to PDF bytes via Gotenberg (Chromium).
#
# ENV:
#   GOTENBERG_URL — e.g. http://gotenberg:3000 (docker) or http://localhost:3100
#   PRINT_APP_URL — base URL Gotenberg uses to fetch the print page (must be
#                   reachable from the Gotenberg container/pod)
class HtmlPdfService
  class Error < StandardError
  end

  def initialize(
    gotenberg_url: ENV.fetch("GOTENBERG_URL", nil),
    app_url: ENV.fetch("PRINT_APP_URL", nil)
  )
    @gotenberg_url = gotenberg_url.presence
    @app_url = app_url.presence || default_app_url
  end

  # @param path [String] app-relative path including query (e.g. "/permit-applications/…/step-code/print?print_token=…")
  # @return [String] raw PDF bytes
  def convert_path(path)
    raise Error, "GOTENBERG_URL is not configured" if @gotenberg_url.blank?

    url =
      "#{@app_url.to_s.chomp("/")}#{path.start_with?("/") ? path : "/#{path}"}"
    convert_url(url)
  end

  def convert_url(url)
    raise Error, "GOTENBERG_URL is not configured" if @gotenberg_url.blank?

    response =
      connection.post("/forms/chromium/convert/url") do |req|
        req.body = {
          url: url,
          waitDelay: "2s",
          waitForExpression: "document.querySelector('#print-ready') !== null",
          printBackground: "true",
          paperWidth: "8.5",
          paperHeight: "11",
          marginTop: "0.5",
          marginBottom: "0.5",
          marginLeft: "0.5",
          marginRight: "0.5"
        }
      end

    unless response.success?
      raise Error,
            "Gotenberg convert failed (#{response.status}): #{response.body.to_s.truncate(500)}"
    end

    body = response.body
    raise Error, "Gotenberg returned empty body" if body.blank?
    unless body.to_s.start_with?("%PDF")
      raise Error, "Gotenberg response is not a PDF"
    end

    body
  end

  # Writes PDF bytes to a Tempfile and yields it (binmode).
  def with_tempfile(pdf_bytes, filename: "document.pdf")
    file = Tempfile.new(["html-pdf", File.extname(filename).presence || ".pdf"])
    file.binmode
    file.write(pdf_bytes)
    file.rewind
    yield file
  ensure
    file&.close!
  end

  private

  def connection
    @connection ||=
      Faraday.new(url: @gotenberg_url) do |f|
        f.request :multipart
        f.request :url_encoded
        f.adapter Faraday.default_adapter
        f.options.timeout = 120
        f.options.open_timeout = 10
      end
  end

  def default_app_url
    opts = Rails.application.routes.default_url_options
    host = opts[:host].presence || "localhost"
    port = opts[:port]
    protocol = opts[:protocol].presence || "http"
    port_part =
      port.present? && ![80, 443].include?(port.to_i) ? ":#{port}" : ""
    "#{protocol}://#{host}#{port_part}"
  end
end
