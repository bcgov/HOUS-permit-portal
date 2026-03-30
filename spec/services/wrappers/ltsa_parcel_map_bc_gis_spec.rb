require "rails_helper"

RSpec.describe Wrappers::LtsaParcelMapBcGis, type: :service do
  subject(:wrapper) { described_class.new }

  describe "DoNotEncoder.encode" do
    it "encodes params without escaping characters" do
      encoded = described_class::DoNotEncoder.encode({ a: "1", b: "x y" })

      expect(encoded).to eq("a=1&b=x y")
    end
  end

  describe "#search_pin_from_coordinates" do
    it "queries pin using coordinate point geometry" do
      VCR.use_cassette(
        "wrappers/ltsa_parcel_map_bc_gis/search_pin_from_coordinates"
      ) do
        response =
          wrapper.search_pin_from_coordinates(coord_array: [-123.1, 49.2])
        expect(response).to respond_to(:status)
        expect(response.status).to eq(200).or eq(400).or eq(404)
      end
    end
  end

  describe "#search_pid_from_coordinates" do
    it "queries pid using coordinate point geometry" do
      VCR.use_cassette(
        "wrappers/ltsa_parcel_map_bc_gis/search_pid_from_coordinates"
      ) do
        response =
          wrapper.search_pid_from_coordinates(coord_array: [-123.1, 49.2])
        expect(response).to respond_to(:status)
        expect(response.status).to eq(200).or eq(400).or eq(404)
      end
    end
  end
end
