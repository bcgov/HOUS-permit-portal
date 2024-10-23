require "rails_helper"

RSpec.describe Wrappers::DigitalSealValidator do
  # it "should return an error if it fails to run" do
  #   Faraday.should_receive(:post).and_yield()
  # end

  it "should detect there is no seal" do
    VCR.use_cassette("wrappers/digital_seal_validator/unsigned") do
      result =
        Wrappers::DigitalSealValidator.new.call(
          "spec/support/Test\ Document\ Seal\ -\ unsigned.pdf",
          "application/pdf"
        )
      expect(result.success).to eq false
      expect(result.signatures).to eq []
    end
  end

  context "detects a seal" do
    it "validates a Engineering seal" do
      VCR.use_cassette(
        "wrappers/digital_seal_validator/signed_approved_orgs"
      ) do
        result =
          Wrappers::DigitalSealValidator.new.call(
            "spec/support/TEST OF ENGINEERING DIGITAL SEAL RECOGNITION - Sealed.pdf",
            "application/pdf"
          )
        expect(result.success).to eq true
        expect(result.signatures.length).to be > 0
      end
    end

    it "validates a pdf with a seal and return the seal types" do
      VCR.use_cassette("wrappers/digital_seal_validator/signed_documents") do
        %w[
          spec/support/signed_converted.pdf
          spec/support/Signed_invisible.pdf
          spec/support/signed_two_people.pdf
        ].each do |file|
          result =
            Wrappers::DigitalSealValidator.new.call(file, "application/pdf")
          expect(result.success).to eq true
          expect(result.signatures.length).to be > 0
        end
      end
    end
  end
end
