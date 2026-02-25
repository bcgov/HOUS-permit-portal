require "rails_helper"

RSpec.describe Wrappers::LtsaParcelMapBc, type: :service do
  subject(:wrapper) { described_class.new }

  describe "#get_feature_attributes_by_pid" do
    it "returns parsed attributes on success" do
      response =
        instance_double(
          "Faraday::Response",
          success?: true,
          body: { features: [{ attributes: { "PID" => "123" } }] }.to_json
        )
      allow(wrapper).to receive(:get_details_by_pid).and_return(response)

      expect(wrapper.get_feature_attributes_by_pid(pid: "123")).to eq(
        "PID" => "123"
      )
    end

    it "raises when ltsa response is unsuccessful" do
      response =
        instance_double("Faraday::Response", success?: false, body: "{}")
      allow(wrapper).to receive(:get_details_by_pid).and_return(response)

      expect {
        wrapper.get_feature_attributes_by_pid(pid: "123")
      }.to raise_error(Errors::LtsaUnavailableError)
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
      allow(wrapper).to receive(:get_details_by_pid).and_raise(
        Errors::FeatureAttributesRetrievalError
      )

      expect(wrapper.get_coordinates_by_pid("123")).to be_nil
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
