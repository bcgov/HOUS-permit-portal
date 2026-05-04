require "rails_helper"

A_CLIENT_ERROR = "a client error"

RSpec.describe "ReleaseNotes", type: :request do
  include Devise::Test::IntegrationHelpers
  subject { json_response.fetch("data") }
  let(:error_message) { json_response.dig("meta", "message", "message") }
  let(:super_admin) { create(:user, :super_admin) }
  let(:submitter) { create(:user, :submitter) }
  let(:params) do
    {
      version: Faker::App.semantic_version,
      release_date: Faker::Date.between(from: 1.year.ago, to: Time.current),
      content: Faker::Lorem.paragraph,
      release_notes_url: Faker::Internet.url,
      issues: Faker::Lorem.paragraph
    }
  end

  def setup
    sign_in super_admin
    @release_note = create(:release_note)
  end

  shared_examples "a client error" do |request|
    it "returns an error if the user is not authorized" do
      sign_in submitter
      instance_exec(
        { id: create(:release_note).id, params: { release_note: params } },
        &request
      )

      expect(response).to have_http_status(:forbidden)
    end
    it "returns an error if the release note is not valid" do
      setup
      instance_exec(
        {
          id: @release_note.id,
          params: {
            release_note: params.merge({ version: nil })
          }
        },
        &request
      )

      expect(response).to have_http_status(:bad_request)
      expect(error_message).to match(/version.*blank/i)
    end
  end

  describe "#create" do
    it "creates a release note" do
      sign_in super_admin
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

    it_behaves_like A_CLIENT_ERROR,
                    ->(payload) do
                      post release_notes_path, params: payload[:params]
                    end
  end

  describe "#update" do
    it "updates a release note" do
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

    it_behaves_like A_CLIENT_ERROR,
                    ->(payload) do
                      patch release_note_path(payload[:id]),
                            params: payload[:params]
                    end
  end

  describe "#publish" do
    it "publishes a release note" do
      setup
      patch publish_release_note_path(@release_note.id)

      expect(response).to have_http_status(:success)
      expect(subject).to include("status" => "published")
    end

    it_behaves_like A_CLIENT_ERROR,
                    ->(payload) do
                      patch publish_release_note_path(payload[:id]),
                            params: payload[:params]
                    end
  end
end
