require "rails_helper"

RSpec.describe "ReleaseNotes", type: :request do
  include Devise::Test::IntegrationHelpers
  subject { json_response.fetch("data") }
  let(:error_message) { json_response.dig("meta", "message", "message") }
  let(:user) { create(:user, :super_admin) }
  let(:params) do
    {
      version: Faker::App.semantic_version,
      release_date: Faker::Date.between(from: 1.year.ago, to: Time.current),
      content: Faker::Lorem.paragraph,
      release_notes_url: Faker::Internet.url,
      issues: Faker::Lorem.paragraph
    }
  end
  describe "#create" do
    it "creates a release note" do
      sign_in user
      post release_notes_path, params: { release_note: params }

      expect(response).to have_http_status(:success)
      expect(subject).to include(
        "version" => params[:version],
        "content" => params[:content],
        "release_notes_url" => params[:release_notes_url],
        "issues" => params[:issues],
        "updated_at" => be_present
      )
      expect(Time.zone.at(subject["release_date"] / 1000).to_date).to eq(
        params[:release_date]
      )
    end

    it "returns an error if the release note is not valid" do
      sign_in user
      post release_notes_path,
           params: {
             release_note: params.merge({ version: nil })
           }

      expect(response).to have_http_status(:bad_request)
      expect(error_message).to match(/version.*blank/i)
    end
  end

  describe "#update" do
    def setup
      sign_in user
      @release_note = create(:release_note)
    end

    it "updates an existing release note" do
      setup
      patch release_note_path(@release_note.id),
            params: {
              release_note: {
                version: params[:version]
              }
            }

      expect(response).to have_http_status(:success)
      expect(subject).to include("version" => params[:version])
    end

    it "returns an error if the release note is not valid" do
      setup
      patch release_note_path(@release_note.id),
            params: {
              release_note: params.merge({ version: nil })
            }

      expect(response).to have_http_status(:bad_request)
      expect(error_message).to match(/version.*blank/i)
    end
  end
end
