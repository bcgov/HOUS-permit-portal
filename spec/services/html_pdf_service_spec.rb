# frozen_string_literal: true

require "rails_helper"

RSpec.describe HtmlPdfService do
  it "raises when GOTENBERG_URL is missing" do
    service = described_class.new(gotenberg_url: nil, app_url: "http://app")

    expect { service.convert_path("/print") }.to raise_error(
      HtmlPdfService::Error,
      /GOTENBERG_URL/
    )
  end

  it "builds an absolute URL from PRINT_APP_URL + path" do
    service =
      described_class.new(
        gotenberg_url: "http://gotenberg.test",
        app_url: "http://app.test"
      )
    expect(service).to receive(:convert_url).with(
      "http://app.test/permit-applications/1/step-code/print?print_token=abc"
    ).and_return("%PDF-1.4")

    expect(
      service.convert_path(
        "/permit-applications/1/step-code/print?print_token=abc"
      )
    ).to eq("%PDF-1.4")
  end

  it "rejects non-PDF responses" do
    stubs = Faraday::Adapter::Test::Stubs.new
    stubs.post("/forms/chromium/convert/url") { [200, {}, "not a pdf"] }

    test_conn =
      Faraday.new(url: "http://gotenberg.test") { |f| f.adapter :test, stubs }

    service =
      described_class.new(
        gotenberg_url: "http://gotenberg.test",
        app_url: "http://app.test"
      )
    allow(service).to receive(:connection).and_return(test_conn)

    expect { service.convert_url("http://app.test/print") }.to raise_error(
      HtmlPdfService::Error,
      /not a PDF/
    )
  end
end
