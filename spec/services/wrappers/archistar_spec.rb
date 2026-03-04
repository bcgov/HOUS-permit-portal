require "rails_helper"

RSpec.describe Wrappers::Archistar, type: :service do
  subject(:wrapper) { described_class.new }

  describe "#comply_certificates" do
    it "records and replays a real comply certificates request" do
      VCR.use_cassette("wrappers/archistar/comply_certificates") do
        result = wrapper.comply_certificates("bcbc")
        expect(result).to be_a(Array)
      end
    end
  end

  describe "#get_submission" do
    it "records and replays a real get submission request" do
      VCR.use_cassette("wrappers/archistar/get_submission_invalid_real") do
        expect { wrapper.get_submission("invalid-external-id") }.to raise_error(
          Errors::WrapperClientError
        )
      end
    end
  end

  describe "#get_submission_analytics" do
    it "records and replays a real analytics request" do
      VCR.use_cassette(
        "wrappers/archistar/get_submission_analytics_invalid_real"
      ) do
        expect {
          wrapper.get_submission_analytics("invalid-external-id")
        }.to raise_error(Errors::WrapperClientError)
      end
    end
  end
end
