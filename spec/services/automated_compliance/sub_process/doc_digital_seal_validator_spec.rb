require "rails_helper"

RSpec.describe AutomatedCompliance::SubProcess::DocDigitalSealValidator do
  it "raises an error if no document provided" do
    expect {
      AutomatedCompliance::SubProcess::DocDigitalSealValidator.new.call(nil)
    }.to raise_error { ArgumentError }
  end

  context "document provided" do
    let(:supporting_document) { create(:supporting_document) }
    let(:approved_signature) do
      {
        "signerStatus" => {
          "certificateInfo" => {
            "subjectName" =>
              "CN=Signer, OU=Engineers and Geoscientists British Columbia"
          }
        }
      }
    end
    let(:unapproved_signature) do
      {
        "signerStatus" => {
          "certificateInfo" => {
            "subjectName" => "CN=Signer, OU=Some Other Organization"
          }
        }
      }
    end

    context "the integration call has an error" do
      it "updates the status of the supporting document with failure" do
        allow_any_instance_of(Wrappers::DigitalSealValidator).to receive(
          :call
        ).and_return(
          OpenStruct.new(success: false, error: "test error", signatures: [])
        )
        AutomatedCompliance::SubProcess::DocDigitalSealValidator.new.call(
          supporting_document
        )
        expect(supporting_document.compliance_data["status"]).to eq "failed"
      end
    end

    context "the integration call returns UNSIGNED" do
      it "stores an empty success result like the standalone not-found state" do
        allow_any_instance_of(Wrappers::DigitalSealValidator).to receive(
          :call
        ).and_return(
          OpenStruct.new(success: false, error: "UNSIGNED", signatures: [])
        )
        AutomatedCompliance::SubProcess::DocDigitalSealValidator.new.call(
          supporting_document
        )
        expect(supporting_document.compliance_data["status"]).to eq "success"
        expect(supporting_document.compliance_data["result"]).to eq([])
      end
    end

    context "the integration call succeeds" do
      it "stores only approved organization signatures" do
        allow_any_instance_of(Wrappers::DigitalSealValidator).to receive(
          :call
        ).and_return(
          OpenStruct.new(
            success: true,
            signatures: [approved_signature, unapproved_signature]
          )
        )
        AutomatedCompliance::SubProcess::DocDigitalSealValidator.new.call(
          supporting_document
        )
        expect(supporting_document.compliance_data["status"]).to eq "success"
        expect(supporting_document.compliance_data["result"]).to eq(
          [approved_signature]
        )
      end
    end
  end
end
