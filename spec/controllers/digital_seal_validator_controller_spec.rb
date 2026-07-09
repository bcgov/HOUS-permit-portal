require "rails_helper"

RSpec.describe Api::DigitalSealValidatorController, type: :controller do
  let(:user) { create(:user) }
  let(:validator) { instance_double(Wrappers::DigitalSealValidator) }
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

  before do
    sign_in user
    allow(Wrappers::DigitalSealValidator).to receive(:new).and_return(validator)
  end

  describe "POST #create" do
    it "returns success payload when validation succeeds" do
      temp = Tempfile.new(%w[sample .pdf])
      temp.write("pdf-bytes")
      temp.rewind
      file = Rack::Test::UploadedFile.new(temp.path, "application/pdf")
      result = OpenStruct.new(success: true, signatures: [approved_signature])
      allow(validator).to receive(:call).and_return(result)

      post :create, params: { file: file }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["status"]).to eq("found")
      expect(json_response["signatures"]).to be_present
      temp.close!
    end

    it "returns empty signatures when the document has no seal" do
      temp = Tempfile.new(%w[sample .pdf])
      temp.write("pdf-bytes")
      temp.rewind
      file = Rack::Test::UploadedFile.new(temp.path, "application/pdf")
      result = OpenStruct.new(success: false, signatures: [], error: "UNSIGNED")
      allow(validator).to receive(:call).and_return(result)

      post :create, params: { file: file }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["status"]).to eq("notFound")
      expect(json_response["signatures"]).to eq([])
      expect(json_response).not_to have_key("error")
      temp.close!
    end

    it "returns not found when signatures are not from approved organizations" do
      temp = Tempfile.new(%w[sample .pdf])
      temp.write("pdf-bytes")
      temp.rewind
      file = Rack::Test::UploadedFile.new(temp.path, "application/pdf")
      result = OpenStruct.new(success: true, signatures: [unapproved_signature])
      allow(validator).to receive(:call).and_return(result)

      post :create, params: { file: file }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["status"]).to eq("notFound")
      expect(json_response["signatures"]).to eq([])
      temp.close!
    end

    it "returns error when no file is provided" do
      post :create, params: {}, format: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response["meta"]["message"]["message"]).to eq(
        "No file was provided"
      )
    end
  end
end
