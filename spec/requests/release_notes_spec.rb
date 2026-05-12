require "rails_helper"

AN_INVALID_PAYLOAD_RESPONSE = "an invalid payload response"
A_NOT_FOUND_RESPONSE = "a not found response"

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

  shared_examples AN_INVALID_PAYLOAD_RESPONSE do |request|
    it "returns an error if the user is not authorized" do
      sign_in submitter
      instance_exec(
        {
          id: create(:release_note, status: :published).id,
          params: {
            release_note: params
          }
        },
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

  shared_examples A_NOT_FOUND_RESPONSE do |request|
    it "returns an error if the release note is not found" do
      sign_in super_admin
      instance_exec({ id: 0, params: { release_note: params } }, &request)
      expect(response).to have_http_status(:not_found)
      expect(error_message).to match(/not.*found/i)
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

    it_behaves_like AN_INVALID_PAYLOAD_RESPONSE,
                    ->(payload) do
                      post release_notes_path, params: payload[:params]
                    end
  end

  describe "#update" do
    update_with_payload =
      lambda do |payload|
        patch release_note_path(payload[:id]), params: payload[:params]
      end

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

    it "sets the status to draft" do
      setup
      @release_note.update!(status: :published)
      patch release_note_path(@release_note.id),
            params: {
              release_note: {
                version: params[:version]
              }
            }
      expect(subject).to include("status" => "draft")
    end

    it_behaves_like AN_INVALID_PAYLOAD_RESPONSE, update_with_payload
    it_behaves_like A_NOT_FOUND_RESPONSE, update_with_payload
  end

  describe "#publish" do
    publish_with_payload =
      lambda do |payload|
        patch publish_release_note_path(payload[:id]), params: payload[:params]
      end

    it "publishes a release note" do
      setup
      patch publish_release_note_path(@release_note.id)

      expect(response).to have_http_status(:success)
      expect(subject).to include("status" => "published")
    end

    it_behaves_like AN_INVALID_PAYLOAD_RESPONSE, publish_with_payload
    it_behaves_like A_NOT_FOUND_RESPONSE, publish_with_payload
  end

  describe "#index" do
    let!(:earliest_release_note) do
      create(
        :release_note,
        status: :published,
        version: "1.0.0",
        release_date: 2.day.ago,
        updated_at: 2.day.ago
      )
    end
    let!(:latest_release_note) do
      create(
        :release_note,
        status: :draft,
        version: "1.0.1",
        release_date: 1.days.ago,
        updated_at: 1.days.ago
      )
    end

    it "returns all release notes for super admins" do
      sign_in super_admin
      get release_notes_path

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 2)
      subject.each do |release_note|
        expect(release_note).not_to include("internal_notes")
        expect(release_note).not_to include("debug_info")
      end
    end

    it "returns published release notes for non-super admins" do
      sign_in submitter
      get release_notes_path

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 1)
      expect(subject).to all(include("issues", "content"))
    end

    it "paginates the response" do
      sign_in super_admin
      get release_notes_path, params: { page: 2, per_page: 1 }

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 1)
    end

    describe "sorts", :aggregate_failures do
      def self.it_sorts_by(field, direction, release_note)
        it "by #{field} #{direction}" do
          sign_in super_admin
          get release_notes_path,
              params: {
                sort: {
                  field: field,
                  direction: direction
                }
              }

          expect(subject.first["id"]).to eq(public_send(release_note).id)
        end
      end

      it_sorts_by "release_date", "asc", :earliest_release_note
      it_sorts_by "release_date", "desc", :latest_release_note
      it_sorts_by "status", "asc", :latest_release_note
      it_sorts_by "status", "desc", :earliest_release_note
      it_sorts_by "updated_at", "asc", :earliest_release_note
      it_sorts_by "updated_at", "desc", :latest_release_note
    end
  end

  describe "#show" do
    it "returns a release note" do
      setup
      get release_note_path(@release_note.id)

      expect(response).to have_http_status(:success)
      expect(subject).to include("version" => @release_note.version)
    end

    it "returns an error if a non-admin tries to access a draft release note" do
      sign_in submitter
      get release_note_path(create(:release_note).id)

      expect(response).to have_http_status(:not_found)
    end

    it_behaves_like A_NOT_FOUND_RESPONSE,
                    ->(payload) { get release_note_path(payload[:id]) }
  end
end
