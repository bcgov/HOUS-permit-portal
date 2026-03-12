require "rails_helper"

RSpec.describe Api::DigitalSealValidatorController, type: :controller do
  let(:user) { create(:user) }
  let(:validator) { instance_double(Wrappers::DigitalSealValidator) }

  before do
    sign_in user
    allow(Wrappers::DigitalSealValidator).to receive(:new).and_return(validator)
  end

  describe "POST #create" do
    it "returns success metadata when validation succeeds" do
      temp = Tempfile.new(%w[sample .pdf])
      temp.write("pdf-bytes")
      temp.rewind
      file = Rack::Test::UploadedFile.new(temp.path, "application/pdf")
      result = OpenStruct.new(success: true, signatures: [{ signer: "A" }])
      allow(validator).to receive(:call).and_return(result)

      post :create, params: { file: file }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["meta"]["status"]).to eq("success")
      expect(json_response["meta"]["signatures"]).to be_present
      temp.close!
    end

    it "returns failure metadata when validation fails" do
      temp = Tempfile.new(%w[sample .pdf])
      temp.write("pdf-bytes")
      temp.rewind
      file = Rack::Test::UploadedFile.new(temp.path, "application/pdf")
      result = OpenStruct.new(success: false, signatures: [], error: "invalid")
      allow(validator).to receive(:call).and_return(result)

      post :create, params: { file: file }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["meta"]["status"]).to eq("failure")
      expect(json_response["meta"]["error"]).to eq("invalid")
      temp.close!
    end
  end
end
