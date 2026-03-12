require "rails_helper"

RSpec.describe FrontendUrlHelper do
  describe ".root_url" do
    it "delegates to Rails route helpers" do
      allow(Rails.application.routes.url_helpers).to receive(
        :root_url
      ).and_return("http://example.test/")

      expect(described_class.root_url).to eq("http://example.test/")
    end
  end

  describe ".frontend_url" do
    it "joins root_url and path" do
      allow(Rails.application.routes.url_helpers).to receive(
        :root_url
      ).and_return("http://example.test/")

      expect(described_class.frontend_url("/hello")).to eq(
        "http://example.test/hello"
      )
    end
  end
end
