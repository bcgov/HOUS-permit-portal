require "rails_helper"

RSpec.describe "Api::Notes", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district, project_meetings_enabled: true) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:meeting) do
    create(:project_meeting, :open, permit_project: permit_project)
  end

  before { SiteConfiguration.instance.update!(project_meetings_enabled: true) }

  describe "GET /api/project_meetings/:project_meeting_id/notes" do
    it "returns notes for a visible meeting" do
      note = create(:note, noteable: meeting, user: reviewer)
      sign_in owner

      get "/api/project_meetings/#{meeting.id}/notes", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", 0, "id")).to eq(note.id)
      expect(json_response.dig("data", 0, "author_name")).to eq(reviewer.name)
      expect(json_response.dig("data", 0)).not_to have_key("author_email")
      expect(json_response.dig("data", 0)).not_to have_key("project_meeting_id")
      expect(json_response.dig("data", 0, "noteable_type")).to eq(
        ProjectMeeting.name
      )
      expect(json_response.dig("data", 0, "noteable_id")).to eq(meeting.id)
    end

    it "returns draft meeting notes for jurisdiction review staff" do
      draft_meeting = create(:project_meeting, permit_project: permit_project)
      note = create(:note, noteable: draft_meeting, user: reviewer)
      sign_in reviewer

      get "/api/project_meetings/#{draft_meeting.id}/notes", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", 0, "id")).to eq(note.id)
    end
  end

  describe "POST /api/project_meetings/:project_meeting_id/notes" do
    it "allows jurisdiction review staff to create notes for active meetings" do
      sign_in reviewer

      expect do
        post "/api/project_meetings/#{meeting.id}/notes",
             params: {
               note: {
                 body: "<p>Called requester.</p>"
               }
             },
             headers: headers,
             as: :json
      end.to change(Note, :count).by(1).and change {
              meeting.reload.notes_count
            }.from(0).to(1)

      expect(response).to have_http_status(:created)
      expect(Note.last.permit_project).to eq(permit_project)
      expect(json_response.dig("data", "body")).to eq(
        "<p>Called requester.</p>"
      )
    end

    it "allows jurisdiction review staff to create notes for completed meetings" do
      completed_meeting =
        create(:project_meeting, :completed, permit_project: permit_project)
      sign_in reviewer

      expect do
        post "/api/project_meetings/#{completed_meeting.id}/notes",
             params: {
               note: {
                 body: "<p>Post-meeting follow-up.</p>"
               }
             },
             headers: headers,
             as: :json
      end.to change(Note, :count).by(1).and change {
              completed_meeting.reload.notes_count
            }.from(0).to(1)

      expect(response).to have_http_status(:created)
      expect(json_response.dig("data", "body")).to eq(
        "<p>Post-meeting follow-up.</p>"
      )
    end

    it "blocks project owners from creating reviewer notes" do
      sign_in owner

      post "/api/project_meetings/#{meeting.id}/notes",
           params: {
             note: {
               body: "<p>Owner note.</p>"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "allows jurisdiction review staff to create notes for closed meetings" do
      closed_meeting =
        create(:project_meeting, :closed, permit_project: permit_project)
      sign_in reviewer

      expect do
        post "/api/project_meetings/#{closed_meeting.id}/notes",
             params: {
               note: {
                 body: "<p>Post-close follow-up.</p>"
               }
             },
             headers: headers,
             as: :json
      end.to change(Note, :count).by(1).and change {
              closed_meeting.reload.notes_count
            }.from(0).to(1)

      expect(response).to have_http_status(:created)
      expect(json_response.dig("data", "body")).to eq(
        "<p>Post-close follow-up.</p>"
      )
    end
  end

  describe "GET /api/project_meetings/:project_meeting_id/notes/download_csv" do
    it "downloads meeting notes as CSV" do
      create(:note, noteable: meeting, user: reviewer, body: "<p>CSV body</p>")
      sign_in owner

      get "/api/project_meetings/#{meeting.id}/notes/download_csv",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/csv")
      expect(response.body).to include("CSV body")
      expect(response.body).not_to include("<p>")
      expect(CSV.parse(response.body).first).to eq(
        [
          "Author",
          "Created at",
          "Related item type",
          "Related item id",
          "Project number",
          "Body"
        ]
      )
      expect(CSV.parse(response.body).last.length).to eq(6)
    end
  end

  describe "GET /api/permit_projects/:permit_project_id/notes" do
    it "returns project meeting notes for a project" do
      project_note = create(:note, noteable: meeting, user: reviewer)
      create(:note)
      sign_in reviewer

      get "/api/permit_projects/#{permit_project.id}/notes", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.fetch("data").map { |note| note.fetch("id") }).to eq(
        [project_note.id]
      )
    end

    it "returns project meeting notes for the project owner" do
      project_note = create(:note, noteable: meeting, user: reviewer)
      sign_in owner

      get "/api/permit_projects/#{permit_project.id}/notes", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.fetch("data").map { |note| note.fetch("id") }).to eq(
        [project_note.id]
      )
      expect(json_response.dig("data", 0)).not_to have_key("author_email")
    end

    it "includes project meeting notes regardless of meeting status for review staff" do
      draft_note =
        create(
          :note,
          noteable: create(:project_meeting, permit_project: permit_project),
          user: reviewer
        )
      closed_note =
        create(
          :note,
          noteable:
            create(:project_meeting, :closed, permit_project: permit_project),
          user: reviewer
        )
      sign_in reviewer

      get "/api/permit_projects/#{permit_project.id}/notes", headers: headers

      note_ids = json_response.fetch("data").map { |note| note.fetch("id") }
      expect(note_ids).to include(draft_note.id, closed_note.id)
    end
  end

  describe "GET /api/permit_projects/:permit_project_id/notes/download_csv" do
    it "downloads all meeting notes for the project as CSV" do
      create(
        :note,
        noteable: meeting,
        user: reviewer,
        body: "<p>Project CSV</p>"
      )
      sign_in reviewer

      get "/api/permit_projects/#{permit_project.id}/notes/download_csv",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/csv")
      expect(response.body).to include("Project CSV")
    end
  end
end
