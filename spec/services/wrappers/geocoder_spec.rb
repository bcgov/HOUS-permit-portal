require "rails_helper"

RSpec.describe Wrappers::Geocoder, type: :service do
  subject(:wrapper) { described_class.new }

  let(:vcr_options) { { match_requests_on: %i[method path query] } }

  describe "#site_options_raw" do
    it "records and replays a real geocoder address lookup request" do
      VCR.use_cassette(
        "wrappers/geocoder/site_options_raw_real",
        vcr_options
      ) do
        result = wrapper.site_options_raw("757 W Hastings St, Vancouver, BC")
        expect(result).to be_a(Hash)
        expect(result).to have_key("features")
      end
    end
  end

  describe "#site_options" do
    it "includes coordinates from the geocoder feature" do
      allow(wrapper).to receive(:get).with(
        "/addresses.json",
        anything
      ).and_return(
        {
          "features" => [
            {
              "geometry" => {
                "coordinates" => [-123.1, 49.7]
              },
              "properties" => {
                "matchPrecision" => "CIVIC_NUMBER",
                "fullAddress" => "123 Main St",
                "siteID" => "site-1"
              }
            }
          ]
        }
      )
      allow(wrapper).to receive(:subsites).and_raise(
        StandardError,
        "no subsites"
      )

      result = wrapper.site_options("123 Main St")

      expect(result.first[:coordinates]).to eq([-123.1, 49.7])
    end
  end

  describe "#pids" do
    it "records and replays a real pids lookup request" do
      VCR.use_cassette("wrappers/geocoder/pids_real", vcr_options) do
        site_options = wrapper.site_options("757 W Hastings St, Vancouver, BC")
        if site_options.blank?
          skip "No geocoder site options returned for test address"
        end
        site_id = site_options.first[:value]

        result = wrapper.pids(site_id)
        expect(result).to be_a(Array)
      end
    end

    context "when geocoder returns no pids" do
      let(:site_id) { "empty-site" }

      before do
        allow(wrapper).to receive(:get).with(
          "/parcels/pids/#{site_id}.json"
        ).and_return({ "pids" => "" })
      end

      it "falls back to LTSA PIDs from site coordinates" do
        allow(wrapper).to receive(:site).with(site_id).and_return(
          { "geometry" => { "coordinates" => [-123.1, 49.7] } }
        )
        ltsa = instance_double(Wrappers::LtsaParcelMapBc)
        allow(Wrappers::LtsaParcelMapBc).to receive(:new).and_return(ltsa)
        response =
          instance_double(
            Faraday::Response,
            success?: true,
            body: {
              "features" => [{ "attributes" => { "PID" => "015234567" } }]
            }.to_json
          )
        allow(ltsa).to receive(:search_pid_from_coordinates).with(
          coord_array: [-123.1, 49.7]
        ).and_return(response)

        expect(wrapper.pids(site_id)).to eq(["015234567"])
      end

      it "returns empty when the site has no coordinates" do
        allow(wrapper).to receive(:site).with(site_id).and_return(
          { "features" => [] }
        )

        expect(Wrappers::LtsaParcelMapBc).not_to receive(:new)
        expect(wrapper.pids(site_id)).to eq([])
      end
    end
  end
end
