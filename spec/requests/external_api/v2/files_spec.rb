require "swagger_helper"

RSpec.describe "external_api/v2/files",
               type: :request,
               openapi_spec: "external_api/v2/swagger.yaml" do
  let!(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let!(:Authorization) { "Bearer #{external_api_key.token}" }

  path "/files" do
    post "Uploads one reference file for a later document revision request. Returns a cache id to send as `reference_document_ids` on PATCH /permit_applications/{id}/status. Does not change an application and does not return a download URL." do
      tags "Files"
      consumes "multipart/form-data"
      produces "application/json"
      parameter name: :file, in: :formData, type: :file, required: true

      let(:file) do
        Rack::Test::UploadedFile.new(
          Rails.root.join("spec/support/signed_converted.pdf"),
          "application/pdf",
          true,
          original_filename: "site-plan.pdf"
        )
      end

      response(201, "File stored") do
        schema type: :object,
               properties: {
                 data: {
                   "$ref" => "#/components/schemas/CachedFile"
                 }
               },
               required: %w[data]

        run_test!
      end

      response(422, "Missing file, blocked extension, or file too large") do
        schema "$ref" => "#/components/schemas/ResponseError"
        let(:file) do
          Rack::Test::UploadedFile.new(
            Rails.root.join("spec/support/signed_converted.pdf"),
            "application/octet-stream",
            true,
            original_filename: "payload.exe"
          )
        end

        run_test!
      end
    end
  end
end
