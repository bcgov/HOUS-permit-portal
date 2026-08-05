require "rails_helper"

RSpec.describe DigitalSealSignatureFilter do
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
  let(:aibc_signature) do
    {
      "signerStatus" => {
        "certificateInfo" => {
          "subjectName" => "CN=Architect, OU=AIBC"
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

  it "keeps AIBC and EGBC signatures" do
    expect(
      described_class.call(
        [approved_signature, aibc_signature, unapproved_signature]
      )
    ).to eq([approved_signature, aibc_signature])
  end

  it "returns an empty array when there are no approved signatures" do
    expect(described_class.call([unapproved_signature])).to eq([])
  end

  it "handles nil signatures" do
    expect(described_class.call(nil)).to eq([])
  end
end
