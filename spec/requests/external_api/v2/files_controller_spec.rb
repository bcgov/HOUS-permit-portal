require "rails_helper"

RSpec.describe "External API v2 files", type: :request do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }

  def upload_file(filename: "site-plan.pdf", key: external_api_key)
    post "/external_api/v2/files",
         params: {
           file:
             Rack::Test::UploadedFile.new(
               Rails.root.join("spec/support/signed_converted.pdf"),
               "application/pdf",
               true,
               original_filename: filename
             )
         },
         headers: {
           "Authorization" => "Bearer #{key.token}"
         }
  end

  it "stores a reference file in the cache and returns its id" do
    upload_file

    expect(response).to have_http_status(:created)
    json = JSON.parse(response.body).fetch("data")
    expect(json["id"]).to end_with("/site-plan.pdf")
    expect(json["name"]).to eq("site-plan.pdf")
    expect(json["type"]).to eq("application/pdf")
    expect(json["size"]).to be > 0
    expect(json).not_to have_key("url")
    expect(Shrine.storages[:cache].exists?(json["id"])).to be true
  end

  it "rejects a missing file" do
    post "/external_api/v2/files",
         headers: {
           "Authorization" => "Bearer #{external_api_key.token}"
         }

    expect(response).to have_http_status(:unprocessable_content)
    expect(JSON.parse(response.body).dig("meta", "message")).to eq(
      "file is missing"
    )
  end

  it "rejects a blocked extension" do
    upload_file(filename: "payload.exe")

    expect(response).to have_http_status(:unprocessable_content)
    expect(JSON.parse(response.body).dig("meta", "message")).to eq(
      "file extension is not allowed"
    )
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    upload_file(key: v1_key)

    expect(response).to have_http_status(:forbidden)
  end
end
