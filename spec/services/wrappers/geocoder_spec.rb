require "rails_helper"

RSpec.describe Wrappers::Geocoder, type: :service do
  subject(:wrapper) { described_class.new }

  describe "#site_options" do
    it "returns nearest options when only coordinates are provided" do
      allow(wrapper).to receive(:nearest_options).and_return(
        [{ label: "A", value: "site-a" }]
      )

      result = wrapper.site_options(nil, [-123.1, 49.2])

      expect(result).to eq([{ label: "A", value: "site-a" }])
      expect(wrapper).to have_received(:nearest_options).with("-123.1,49.2")
    end

    it "returns filtered options and includes subsites when available" do
      allow(wrapper).to receive(:get).with(
        "/addresses.json",
        any_args
      ).and_return(
        {
          "features" => [
            {
              "properties" => {
                "matchPrecision" => "CIVIC_NUMBER",
                "fullAddress" => "123 Main St",
                "siteID" => "site-1"
              }
            },
            {
              "properties" => {
                "matchPrecision" => "STREET",
                "fullAddress" => "ignored",
                "siteID" => "site-2"
              }
            }
          ]
        }
      )
      allow(wrapper).to receive(:subsites).with("site-1").and_return(
        {
          "features" => [
            {
              "properties" => {
                "fullAddress" => "Unit 101 - 123 Main St",
                "siteID" => "site-1-unit-101"
              }
            }
          ]
        }
      )

      result = wrapper.site_options("123 Main")

      expect(result).to include(
        { label: "123 Main St", value: "site-1" },
        { label: "Unit 101 - 123 Main St", value: "site-1-unit-101" }
      )
    end
  end

  describe "#pids" do
    it "splits pid string by comma or pipe" do
      allow(wrapper).to receive(:get).and_return({ "pids" => "111|222,333" })

      expect(wrapper.pids("site-1")).to eq(%w[111 222 333])
    end
  end
end
