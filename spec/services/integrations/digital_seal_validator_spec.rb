require "rails_helper"

RSpec.describe Integrations::DigitalSealValidator do
  # it "should return an error if it fails to run" do
  #   Faraday.should_receive(:post).and_yield()
  # end

  it "should detect there is no seal" do
    VCR.use_cassette("integrations/digital_seal_validator/unsigned") do
      result =
        Integrations::DigitalSealValidator.new.call(
          "spec/support/Test\ Document\ Seal\ -\ unsigned.pdf",
          "application/pdf",
        )
      expect(result.success).to eq false
      expect(result.signatures).to eq []
    end
  end

  context "detects a seal" do
    # it "validates a pdf with a seal and return the seal types" do
    #   VCR.use_cassette("integrations/digital_seal_validator/signed") do
    #     result = Integrations::DigitalSealValidator.new.call("spec/support/real-arch-signed.pdf", "application/pdf")
    #     expect(result.success).to eq true
    #     expect(result.signatures.length).to be > 0
    #   end
    # end

    it "validates a pdf with a seal and return the seal types" do
      VCR.use_cassette("integrations/digital_seal_validator/signed_documents") do
        %w[
          spec/support/signed_converted.pdf
          spec/support/Signed_invisible.pdf
          spec/support/signed_two_people.pdf
        ].each do |file|
          result = Integrations::DigitalSealValidator.new.call(file, "application/pdf")
          expect(result.success).to eq true
          expect(result.signatures.length).to be > 0
        end
      end
    end
  end
end
