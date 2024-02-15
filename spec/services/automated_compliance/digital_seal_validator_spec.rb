require "rails_helper"

RSpec.describe AutomatedCompliance::DigitalSealValidator do
  it "raises an error if no document provided" do
    expect { AutomatedCompliance::DigitalSealValidator.new.call(nil) }.to raise_error { ArgumentError }
  end

  context "document provided" do
    let(:supporting_document) { create(:supporting_document) }

    context "the integration call has an error" do
      it "updates the status of the supporting document with failure" do
        allow_any_instance_of(Integrations::DigitalSealValidator).to receive(:call).and_return(
          OpenStruct.new(success: false, error: "test error", signatures: []),
        )
        AutomatedCompliance::DigitalSealValidator.new.call(supporting_document)
        expect(supporting_document.compliance_data["status"]).to eq "failed"
      end
    end

    context "the integration call succeeds" do
      it "updates the document to have successful information" do
        allow_any_instance_of(Integrations::DigitalSealValidator).to receive(:call).and_return(
          OpenStruct.new(success: true, signatures: [{ test: "payload" }]),
        )
        AutomatedCompliance::DigitalSealValidator.new.call(supporting_document)
        expect(supporting_document.compliance_data["status"]).to eq "success"
      end
    end
  end
end
