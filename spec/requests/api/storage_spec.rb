require "rails_helper"

RSpec.describe "Api::Storage", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:user) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:permit_application) { create(:permit_application, submitter: user) }
  let(:supporting_document) do
    create(
      :supporting_document,
      permit_application: permit_application,
      data_key: "RB123|test_file"
    )
  end
  let(:s3_client) { instance_double(Aws::S3::Client) }
  let(:bucket) { instance_double(Aws::S3::Bucket, name: "test-bucket") }
  let(:presigner) { instance_double(Aws::S3::Presigner) }

  let(:cache_storage) do
    instance_double(
      Shrine::Storage::S3,
      client: s3_client,
      bucket: bucket,
      prefix: "cache"
    )
  end

  before do
    sign_in user
    allow(Shrine).to receive(:storages).and_return(
      Shrine.storages.merge(cache: cache_storage)
    )
  end

  describe "GET /api/s3/params" do
    it "returns presigned upload params" do
      allow(FileUploader).to receive(:presign_response).and_return(
        [200, {}, ["ok"]]
      )

      get "/api/s3/params", headers: headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe "GET /api/s3/params/download" do
    it "returns a file download url for authorized users" do
      get "/api/s3/params/download",
          params: {
            model: "SupportingDocument",
            modelId: supporting_document.id
          },
          headers: headers,
          as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["url"]).to be_present
    end

    it "forbids access for unauthorized users" do
      sign_in other_user

      get "/api/s3/params/download",
          params: {
            model: "SupportingDocument",
            modelId: supporting_document.id
          },
          headers: headers,
          as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/s3/params/multipart" do
    it "creates multipart upload params" do
      allow(s3_client).to receive(:create_multipart_upload).and_return(
        double(upload_id: "upload-123", key: "cache/uuid-test.pdf")
      )

      post "/api/s3/params/multipart",
           params: {
             filename: "test.pdf",
             type: "application/pdf"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["uploadId"]).to eq("upload-123")
    end
  end

  describe "GET /api/s3/params/multipart/:upload_id/batch" do
    it "returns presigned part urls" do
      allow(Aws::S3::Presigner).to receive(:new).and_return(presigner)
      allow(presigner).to receive(:presigned_url).and_return(
        "http://example.com/part"
      )

      get "/api/s3/params/multipart/upload-123/batch",
          params: {
            key: "cache/uuid-test.pdf",
            partNumbers: "1,2"
          },
          headers: headers,
          as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["presignedUrls"].keys).to contain_exactly("1", "2")
    end

    it "returns errors for missing params" do
      get "/api/s3/params/multipart/upload-123/batch", headers: headers

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "POST /api/s3/params/multipart/:upload_id/complete" do
    it "completes a multipart upload" do
      allow(s3_client).to receive(:complete_multipart_upload)

      post "/api/s3/params/multipart/upload-123/complete",
           params: {
             key: "cache/uuid-test.pdf",
             parts: [{ PartNumber: 1, ETag: "etag" }]
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["location"]).to include("s3://test-bucket")
    end
  end

  describe "DELETE /api/s3/params/multipart/:upload_id" do
    it "aborts a multipart upload" do
      allow(s3_client).to receive(:abort_multipart_upload)

      delete "/api/s3/params/multipart/upload-123",
             params: {
               key: "cache/uuid-test.pdf"
             },
             headers: headers,
             as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["message"]).to include("aborted")
    end
  end
end
