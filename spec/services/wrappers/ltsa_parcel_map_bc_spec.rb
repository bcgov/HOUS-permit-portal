require "rails_helper"

RSpec.describe Wrappers::LtsaParcelMapBc, type: :service do
  subject(:wrapper) { described_class.new }

  describe "#get_feature_attributes_by_pid" do
    it "records and replays a real ltsa pid attribute request" do
      VCR.use_cassette(
        "wrappers/ltsa_parcel_map_bc/get_feature_attributes_by_pid_real"
      ) do
        result = wrapper.get_feature_attributes_by_pid(pid: "031562868")
        expect(result).to be_a(Hash)
        expect(result["PID"]).to be_present
      end
    end

    it "records and replays a real ltsa invalid pid request" do
      VCR.use_cassette(
        "wrappers/ltsa_parcel_map_bc/get_feature_attributes_by_pid_invalid_real"
      ) do
        expect {
          wrapper.get_feature_attributes_by_pid(pid: "invalid-pid")
        }.to raise_error(Errors::FeatureAttributesRetrievalError)
      end
    end
  end

  describe "#get_feature_attributes_by_pid_or_pin" do
    it "raises when both pid and pin are blank" do
      expect {
        wrapper.get_feature_attributes_by_pid_or_pin(pid: nil, pin: nil)
      }.to raise_error(Errors::FeatureAttributesRetrievalError)
    end
  end

  describe "#get_coordinates_by_pid" do
    it "returns nil when pid is blank" do
      expect(wrapper.get_coordinates_by_pid(nil)).to be_nil
    end

    it "returns nil when retrieval raises feature attribute error" do
      VCR.use_cassette(
        "wrappers/ltsa_parcel_map_bc/get_coordinates_by_pid_invalid_real"
      ) { expect(wrapper.get_coordinates_by_pid("invalid-pid")).to be_nil }
    end
  end

  describe "#wkid_factory_lookup" do
    it "raises for non-integer wkid values" do
      expect { wrapper.wkid_factory_lookup("4326") }.to raise_error(
        ArgumentError
      )
    end

    it "raises when wkid is out of valid range" do
      expect { wrapper.wkid_factory_lookup(999) }.to raise_error(ArgumentError)
    end
  end
end
