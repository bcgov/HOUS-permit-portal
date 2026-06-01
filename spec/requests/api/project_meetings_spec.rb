require "rails_helper"

RSpec.describe "Api::ProjectMeetings", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) { create(:user, :submitter, phone_number: "2505551212") }
  let(:other_user) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district, project_meetings_enabled: true) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end

  before do
    SiteConfiguration.instance.update!(project_meetings_enabled: true)
    sign_in owner
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings" do
    it "creates a draft meeting request with contact defaults" do
      post "/api/permit_projects/#{permit_project.id}/meetings",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      expect(json_response.dig("data", "status")).to eq("draft")
      expect(json_response.dig("data", "contact_email")).to eq(owner.email)
      expect(json_response.dig("data", "contact_phone_number")).to eq(
        owner.reload.phone_number
      )
    end

    it "blocks non-owners" do
      sign_in other_user

      post "/api/permit_projects/#{permit_project.id}/meetings",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "blocks creation when the feature gate is off" do
      SiteConfiguration.instance.update!(project_meetings_enabled: false)

      post "/api/permit_projects/#{permit_project.id}/meetings",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "blocks creation when the jurisdiction feature gate is off" do
      jurisdiction.update!(project_meetings_enabled: false)

      post "/api/permit_projects/#{permit_project.id}/meetings",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "blocks creating a second active meeting request" do
      create(:project_meeting, permit_project: permit_project)

      post "/api/permit_projects/#{permit_project.id}/meetings",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /api/permit_projects/:permit_project_id/meetings/:id" do
    it "returns a meeting request for the owner" do
      meeting = create(:project_meeting, permit_project: permit_project)
      document = create(:meeting_request_document, project_meeting: meeting)

      get "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}",
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(meeting.id)
      expect(
        json_response.dig("data", "meeting_request_documents", 0, "id")
      ).to eq(document.id)
      expect(
        json_response.dig("data", "meeting_request_documents", 0, "file", "id")
      ).to eq(document.file_id)
      expect(
        json_response.dig(
          "data",
          "meeting_request_documents",
          0,
          "file",
          "metadata",
          "filename"
        )
      ).to eq(document.file_name)
    end
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings/search",
           :search do
    let!(:meeting) do
      create(
        :project_meeting,
        :open,
        permit_project: permit_project,
        project_description: "Need zoning guidance."
      )
    end
    let!(:other_meeting) { create(:project_meeting, :completed) }

    before { ProjectMeeting.reindex }

    it "returns scoped meeting requests for the project owner" do
      post "/api/permit_projects/#{permit_project.id}/meetings/search",
           params: {
             query: "zoning",
             page: 1,
             per_page: 10
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to eq([meeting.id])
      expect(json_response["data"].pluck("id")).not_to include(other_meeting.id)
    end

    it "does not return meetings to unrelated users" do
      sign_in other_user

      post "/api/permit_projects/#{permit_project.id}/meetings/search",
           params: {
             query: "*",
             page: 1,
             per_page: 10
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to be_empty
    end
  end

  describe "PATCH /api/permit_projects/:permit_project_id/meetings/:id" do
    it "updates meeting request step data and documents" do
      meeting = create(:project_meeting, permit_project: permit_project)

      patch "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}",
            params: {
              project_meeting: {
                requester_relationship: "leaseholder_or_tenant",
                project_description: "Demolish and rebuild.",
                meeting_request_documents_attributes: [
                  {
                    document_type: "supporting",
                    file: TestData.cached_file_data
                  }
                ]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "requester_relationship")).to eq(
        "leaseholder_or_tenant"
      )
      expect(
        json_response.dig("data", "meeting_request_documents").length
      ).to eq(1)
      expect(
        json_response.dig(
          "data",
          "meeting_request_documents",
          0,
          "document_type"
        )
      ).to eq("supporting")
    end
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings/:id/submit" do
    it "submits the completed meeting request" do
      meeting = create(:project_meeting, permit_project: permit_project)
      create(
        :meeting_submission_contact,
        jurisdiction: jurisdiction,
        email: "meetings@example.com"
      )

      expect {
        post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/submit",
             headers: headers,
             as: :json
      }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_submitted
      ).and have_enqueued_mail(
              PermitHubMailer,
              :notify_project_meeting_submitted_to_jurisdiction
            ).with(meeting, "meetings@example.com")

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "status")).to eq("open")
      expect(json_response.dig("data", "submitted_at")).to be_present
    end

    it "returns validation errors for incomplete requests" do
      meeting =
        create(
          :project_meeting,
          permit_project: permit_project,
          requester_relationship: nil,
          project_description: nil
        )

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/submit",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "requires authorization documents for non-owner requesters" do
      meeting =
        create(
          :project_meeting,
          permit_project: permit_project,
          requester_relationship: :leaseholder_or_tenant
        )

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/submit",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "submits non-owner requests with authorization documents" do
      meeting =
        create(
          :project_meeting,
          permit_project: permit_project,
          requester_relationship: :owners_representative
        )
      create(
        :meeting_request_document,
        :authorization,
        project_meeting: meeting
      )

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/submit",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "status")).to eq("open")
    end
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings/:id/transition_status" do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }

    it "allows review staff to schedule an open meeting request" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      confirmed_date = 1.week.from_now
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/transition_status",
           params: {
             target_status: "scheduled",
             project_meeting: {
               confirmed_date: confirmed_date.iso8601,
               meeting_url: "https://example.com/meeting"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "status")).to eq("scheduled")
      expect(json_response.dig("data", "scheduled_at")).to be_present
      expect(json_response.dig("data", "confirmed_date")).to be_present
    end

    it "returns validation errors when scheduling without a confirmed date" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/transition_status",
           params: {
             target_status: "scheduled"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "blocks project owners from manually transitioning status" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/transition_status",
           params: {
             target_status: "closed"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
