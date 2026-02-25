require "rails_helper"

RSpec.describe Wrappers::Base, type: :service do
  let(:wrapper_class) do
    Class.new(described_class) do
      def base_url
        "https://example.test"
      end

      def default_headers
        { "X-Test" => "1" }
      end
    end
  end
  let(:wrapper) { wrapper_class.new }
  let(:client) { instance_double("Faraday::Connection") }

  describe "#handle_response" do
    it "returns body hash for successful hash responses" do
      response =
        instance_double("Faraday::Response", success?: true, body: { "a" => 1 })

      expect(wrapper.send(:handle_response, response)).to eq({ "a" => 1 })
    end

    it "parses JSON string body for successful responses" do
      response =
        instance_double("Faraday::Response", success?: true, body: '{"a":1}')

      expect(wrapper.send(:handle_response, response)).to eq({ "a" => 1 })
    end

    it "raises wrapper client error for 4xx responses" do
      response =
        instance_double(
          "Faraday::Response",
          success?: false,
          status: 404,
          body: "missing"
        )

      expect { wrapper.send(:handle_response, response) }.to raise_error(
        Errors::WrapperClientError
      )
    end
  end

  describe "#get" do
    it "calls client and handles response by default" do
      response =
        instance_double(
          "Faraday::Response",
          success?: true,
          body: {
            "ok" => true
          }
        )
      allow(wrapper).to receive(:client).and_return(client)
      allow(client).to receive(:get).with("/path", {}).and_return(response)

      expect(wrapper.send(:get, "/path")).to eq({ "ok" => true })
    end

    it "returns raw response when skip_handle_response is true" do
      response = instance_double("Faraday::Response")
      allow(wrapper).to receive(:client).and_return(client)
      allow(client).to receive(:get).with("/path", {}).and_return(response)

      expect(wrapper.send(:get, "/path", {}, true)).to eq(response)
    end
  end
end
