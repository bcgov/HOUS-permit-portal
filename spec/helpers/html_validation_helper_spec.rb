require "rails_helper"

RSpec.describe HtmlValidationHelper do
  describe ".valid_html?" do
    it "returns true for a valid html string" do
      expect(
        described_class.valid_html?("<html><body><p>ok</p></body></html>")
      ).to eq(true)
    end

    it "returns false when parsing raises" do
      allow(Nokogiri).to receive(:HTML).and_raise(StandardError.new("boom"))
      expect(described_class.valid_html?("<p>x</p>")).to eq(false)
    end
  end
end
