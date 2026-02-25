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
      expect(wrapper).to receive(:get).with(
        "#{Wrappers::LtsaParcelMapBc::PARCEL_SERVICE}/query",
        hash_including(
          where: "PIN+IS+NOT+NULL",
          geometry: "-123.1,49.2",
          geometryType: "esriGeometryPoint"
        ),
        true
      )

      wrapper.search_pin_from_coordinates(coord_array: [-123.1, 49.2])
    end
  end

  describe "#search_pid_from_coordinates" do
    it "queries pid using coordinate point geometry" do
      expect(wrapper).to receive(:get).with(
        "#{Wrappers::LtsaParcelMapBc::PARCEL_SERVICE}/query",
        hash_including(
          where: "PID+IS+NOT+NULL",
          geometry: "-123.1,49.2",
          geometryType: "esriGeometryPoint"
        ),
        true
      )

      wrapper.search_pid_from_coordinates(coord_array: [-123.1, 49.2])
    end
  end
end
