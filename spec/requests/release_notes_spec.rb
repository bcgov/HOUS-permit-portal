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
      release_type: "software",
      version: Faker::App.semantic_version,
      release_date: Faker::Date.between(from: 1.year.ago, to: Time.current),
      content: Faker::Lorem.paragraph,
      release_notes_url: Faker::Internet.url,
      issues: Faker::Lorem.paragraph
    }
  end
  let(:content_params) do
    {
      release_type: "content",
      name: "Step Code wording",
      release_date: Faker::Date.between(from: 1.year.ago, to: Time.current),
      content: Faker::Lorem.paragraph,
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
    it "creates a software release note" do
      sign_in super_admin
      post release_notes_path, params: { release_note: params }

      expect(response).to have_http_status(:success)
      expect(subject).to include(
        "release_type" => "software",
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

    it "creates a content release note" do
      sign_in super_admin
      post release_notes_path, params: { release_note: content_params }

      expect(response).to have_http_status(:success)
      expect(subject).to include(
        "release_type" => "content",
        "name" => content_params[:name],
        "version" => nil,
        "release_notes_url" => nil,
        "content" => content_params[:content]
      )
    end

    it "rejects a content note without a name" do
      sign_in super_admin
      post release_notes_path,
           params: {
             release_note: content_params.merge(name: nil)
           }

      expect(response).to have_http_status(:bad_request)
      expect(error_message).to match(/name.*blank/i)
    end

    it "allows software and content notes on the same release date" do
      sign_in super_admin
      release_date = Date.new(2026, 6, 15)

      post release_notes_path,
           params: {
             release_note: params.merge(release_date: release_date)
           }
      expect(response).to have_http_status(:success)

      post release_notes_path,
           params: {
             release_note: content_params.merge(release_date: release_date)
           }
      expect(response).to have_http_status(:success)
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

    it "ignores attempts to change release type" do
      setup
      patch release_note_path(@release_note.id),
            params: {
              release_note: {
                release_type: "content",
                name: "Step Code wording"
              }
            }

      expect(response).to have_http_status(:success)
      expect(@release_note.reload.release_type).to eq("software")
    end

    it "does not allow a published release note to be saved as a draft" do
      setup
      @release_note.update!(status: :published)
      patch release_note_path(@release_note.id),
            params: {
              release_note: {
                release_date: params[:release_date]
              }
            }

      expect(response).to have_http_status(:bad_request)
      expect(error_message).to match(/no.*draft/i)
      expect(@release_note.reload).to be_published
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

    it "triggers a publish notification" do
      setup
      expect(NotificationService).to receive(
        :publish_release_note_publish_event
      ).with(an_instance_of(ReleaseNote))

      patch publish_release_note_path(@release_note.id)

      expect(response).to have_http_status(:success)
    end

    it "updates an already published release note without publishing again" do
      setup
      @release_note.update!(status: :published)
      expect(NotificationService).not_to receive(
        :publish_release_note_publish_event
      )

      patch publish_release_note_path(@release_note.id),
            params: {
              release_note: {
                content: params[:content]
              }
            }

      expect(response).to have_http_status(:success)
      expect(subject).to include(
        "status" => "published",
        "content" => params[:content]
      )
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

    before { ReleaseNote.reindex }

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

    it "filters by release type" do
      content_release_note =
        create(
          :release_note,
          :content,
          status: :published,
          name: "Step Code wording",
          release_date: 3.days.ago
        )
      ReleaseNote.reindex

      sign_in super_admin

      get release_notes_path, params: { release_type: "software" }
      expect(response).to have_http_status(:success)
      expect(json_response.fetch("data").pluck("id")).to contain_exactly(
        earliest_release_note.id,
        latest_release_note.id
      )

      get release_notes_path, params: { release_type: "content" }
      expect(response).to have_http_status(:success)
      expect(json_response.fetch("data").pluck("id")).to contain_exactly(
        content_release_note.id
      )

      get release_notes_path
      expect(json_response.fetch("data").pluck("id")).to contain_exactly(
        earliest_release_note.id,
        latest_release_note.id,
        content_release_note.id
      )
    end

    it "returns only published release notes when requested by super admins" do
      sign_in super_admin
      get release_notes_path, params: { published_only: true }

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 1)
      expect(subject.first["id"]).to eq(earliest_release_note.id)
    end

    it "returns published release notes for non-super admins" do
      sign_in submitter
      get release_notes_path

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 1)
      expect(subject).to all(include("issues", "content"))
    end

    it "returns published release notes for unauthenticated users" do
      get release_notes_path

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 1)
      expect(subject.first["id"]).to eq(earliest_release_note.id)
    end

    it "paginates the response" do
      sign_in super_admin
      get release_notes_path, params: { page: 2, per_page: 1 }

      expect(response).to have_http_status(:success)
      expect(subject).to have_attributes(length: 1)
    end

    it "filters release notes by year" do
      older_release_note =
        create(
          :release_note,
          status: :published,
          version: "0.9.0",
          release_date: Date.new(2024, 12, 31)
        )
      ReleaseNote.reindex

      sign_in super_admin
      get release_notes_path, params: { year: 2024 }

      expect(response).to have_http_status(:success)
      expect(subject.pluck("id")).to contain_exactly(older_release_note.id)
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

  describe "#index with no release notes" do
    before do
      ReleaseNote.find_each(&:destroy)
      ReleaseNote.reindex
    end

    it "returns an empty response" do
      get release_notes_path

      expect(response).to have_http_status(:success)
      expect(subject).to eq([])
    end
  end

  describe "#show" do
    it "returns a release note" do
      setup
      get release_note_path(@release_note.id)

      expect(response).to have_http_status(:success)
      expect(subject).to include("version" => @release_note.version)
    end

    it "returns an error if a non-admin tries to access a release note" do
      sign_in submitter
      get release_note_path(create(:release_note, status: :published).id)

      expect(response).to have_http_status(:forbidden)
    end

    it "requires authentication" do
      published = create(:release_note, status: :published)
      get release_note_path(published.id)

      expect(response).to have_http_status(:unauthorized)
    end

    it_behaves_like A_NOT_FOUND_RESPONSE,
                    ->(payload) { get release_note_path(payload[:id]) }
  end

  describe "#viewer_context" do
    let!(:newest_in_2025) do
      create(
        :release_note,
        status: :published,
        release_date: Date.new(2025, 6, 1)
      )
    end
    let!(:middle_in_2025) do
      create(
        :release_note,
        status: :published,
        release_date: Date.new(2025, 5, 1)
      )
    end
    let!(:oldest_in_2025) do
      create(
        :release_note,
        status: :published,
        release_date: Date.new(2025, 4, 1)
      )
    end
    let!(:published_2024) do
      create(
        :release_note,
        status: :published,
        release_date: Date.new(2024, 12, 1)
      )
    end
    let!(:draft_in_2025) do
      create(:release_note, status: :draft, release_date: Date.new(2025, 3, 1))
    end

    it "returns year and page for a published note" do
      get viewer_context_release_note_path(oldest_in_2025.id),
          params: {
            per_page: 2
          }

      expect(response).to have_http_status(:success)
      expect(json_response.fetch("data")).to include(
        "release_note_id" => oldest_in_2025.id,
        "year" => 2025,
        "page" => 2
      )
    end

    it "returns page 1 for the newest note in a year" do
      get viewer_context_release_note_path(newest_in_2025.id)

      expect(json_response.fetch("data")).to include("page" => 1)
    end

    it "is available to unauthenticated users for published notes" do
      get viewer_context_release_note_path(middle_in_2025.id)

      expect(response).to have_http_status(:success)
      expect(json_response.fetch("data")).to include(
        "release_note_id" => middle_in_2025.id,
        "year" => 2025,
        "page" => 1
      )
    end

    it "returns not found for draft notes when unauthenticated" do
      get viewer_context_release_note_path(draft_in_2025.id)

      expect(response).to have_http_status(:not_found)
    end

    it_behaves_like A_NOT_FOUND_RESPONSE,
                    ->(payload) do
                      get viewer_context_release_note_path(payload[:id])
                    end
  end
end
