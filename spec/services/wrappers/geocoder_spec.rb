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
  end
end
