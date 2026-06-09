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

    it "allows creating a draft meeting request when an active request exists" do
      create(:project_meeting, :open, permit_project: permit_project)

      post "/api/permit_projects/#{permit_project.id}/meetings",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      expect(json_response.dig("data", "status")).to eq("draft")
    end
  end

  describe "GET /api/project_meetings/:id" do
    it "returns a meeting request for the owner without requiring a project id" do
      meeting = create(:project_meeting, permit_project: permit_project)
      document = create(:meeting_request_document, project_meeting: meeting)

      get "/api/project_meetings/#{meeting.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(meeting.id)
      expect(json_response.dig("data", "permit_project_id")).to eq(
        permit_project.id
      )
      expect(
        json_response.dig("data", "meeting_request_documents", 0, "id")
      ).to eq(document.id)
      expect(
        json_response.dig("data", "meeting_request_documents", 0, "file", "id")
      ).to eq(document.file_id)
    end

    it "returns a submitted meeting request for jurisdiction review staff" do
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      sign_in reviewer

      get "/api/project_meetings/#{meeting.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(meeting.id)
    end

    it "blocks review staff outside the jurisdiction" do
      other_jurisdiction = create(:sub_district, project_meetings_enabled: true)
      reviewer = create(:user, :reviewer, jurisdiction: other_jurisdiction)
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      sign_in reviewer

      get "/api/project_meetings/#{meeting.id}", headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings/search",
           :search do
    let!(:meeting) do
      create(
        :project_meeting,
        :scheduled,
        permit_project: permit_project,
        project_description: "Need zoning guidance."
      )
    end
    let!(:other_meeting) { create(:project_meeting, :completed) }
    let!(:draft_meeting) do
      create(
        :project_meeting,
        permit_project: permit_project,
        project_description: "Draft meeting request.",
        meeting_notes: "Initial draft notes."
      )
    end

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

    it "returns project-scoped submitted meeting requests for jurisdiction review staff" do
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/search",
           params: {
             query: "*",
             page: 1,
             per_page: 10
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to eq([meeting.id])
      expect(json_response["data"].pluck("id")).not_to include(
        draft_meeting.id,
        other_meeting.id
      )
    end

    it "does not return project meetings to review staff outside the jurisdiction" do
      other_jurisdiction = create(:sub_district, project_meetings_enabled: true)
      reviewer = create(:user, :reviewer, jurisdiction: other_jurisdiction)
      sign_in reviewer

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

  describe "POST /api/jurisdictions/:id/project_meetings/search", :search do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
    let(:other_jurisdiction) do
      create(:sub_district, project_meetings_enabled: true)
    end
    let(:matching_project) do
      create(
        :permit_project,
        jurisdiction: jurisdiction,
        number: "CS-0000-0024",
        full_address: "1208 North Rd",
        pid: "012-333-029"
      )
    end
    let!(:meeting) do
      create(
        :project_meeting,
        :open,
        permit_project: matching_project,
        contact_name: "Michael Chan",
        project_description: "Tree removal and new coach house."
      )
    end
    let!(:viewed_meeting) do
      create(
        :project_meeting,
        :scheduled,
        :viewed,
        permit_project:
          create(
            :permit_project,
            jurisdiction: jurisdiction,
            number: "CS-0000-0053"
          )
      )
    end
    let!(:draft_meeting) do
      create(
        :project_meeting,
        permit_project:
          create(
            :permit_project,
            jurisdiction: jurisdiction,
            number: "CS-0000-DRAFT"
          )
      )
    end
    let!(:other_jurisdiction_meeting) do
      create(
        :project_meeting,
        :open,
        permit_project:
          create(:permit_project, jurisdiction: other_jurisdiction)
      )
    end

    before do
      sign_in reviewer
      ProjectMeeting.reindex
    end

    it "returns jurisdiction-scoped submitted meeting requests with metadata" do
      post "/api/jurisdictions/#{jurisdiction.id}/project_meetings/search",
           params: {
             query: "*",
             page: 1,
             per_page: 10
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to contain_exactly(
        meeting.id,
        viewed_meeting.id
      )
      expect(json_response["data"].pluck("id")).not_to include(
        draft_meeting.id,
        other_jurisdiction_meeting.id
      )
      expect(json_response.dig("meta", "unread_count")).to eq(1)
      expect(json_response.dig("meta", "status_counts")).to include(
        "open" => 1,
        "scheduled" => 1
      )
    end

    it "searches by project metadata and requester" do
      post "/api/jurisdictions/#{jurisdiction.id}/project_meetings/search",
           params: {
             query: "Michael",
             page: 1,
             per_page: 10
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to eq([meeting.id])
      expect(json_response.dig("data", 0, "project_number")).to eq(
        "CS-0000-0024"
      )
      expect(json_response.dig("data", 0, "project_address")).to eq(
        "1208 North Rd"
      )
      expect(json_response.dig("data", 0, "project_pid")).to eq("012333029")
    end

    it "filters unread requests without counting drafts" do
      post "/api/jurisdictions/#{jurisdiction.id}/project_meetings/search",
           params: {
             query: "*",
             page: 1,
             per_page: 10,
             filters: {
               unread: "only_show"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to eq([meeting.id])
      expect(json_response.dig("meta", "unread_count")).to eq(1)
    end

    it "blocks users outside the jurisdiction" do
      sign_in create(:user, :reviewer)

      post "/api/jurisdictions/#{jurisdiction.id}/project_meetings/search",
           params: {
             query: "*"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
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

    it "blocks submitting when another active meeting request exists" do
      create(:project_meeting, :open, permit_project: permit_project)
      meeting = create(:project_meeting, permit_project: permit_project)

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/submit",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(meeting.reload).to be_draft
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

  describe "POST /api/permit_projects/:permit_project_id/meetings/:id/cancel" do
    it "allows the project owner to cancel an open meeting request" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/cancel",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "status")).to eq("closed")
      expect(json_response.dig("data", "closed_at")).to be_present
    end

    it "blocks unrelated submitters" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      sign_in other_user

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/cancel",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "blocks review staff from cancelling through the submitter action" do
      reviewer = create(:user, :reviewer, jurisdiction: jurisdiction)
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/cancel",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns unprocessable when the meeting cannot be closed" do
      meeting =
        create(:project_meeting, :completed, permit_project: permit_project)

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/cancel",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(meeting.reload).to be_completed
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
               contact_method: "videoconference",
               confirmed_date: confirmed_date.iso8601,
               meeting_url: "https://example.com/meeting"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "status")).to eq("scheduled")
      expect(json_response.dig("data", "scheduled_at")).to be_present
      expect(json_response.dig("data", "contact_method")).to eq(
        "videoconference"
      )
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

    it "returns validation errors when scheduling without a contact method" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      confirmed_date = 1.week.from_now
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/transition_status",
           params: {
             target_status: "scheduled",
             project_meeting: {
               confirmed_date: confirmed_date.iso8601
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns validation errors when scheduling a videoconference without a meeting link" do
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      confirmed_date = 1.week.from_now
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/transition_status",
           params: {
             target_status: "scheduled",
             project_meeting: {
               contact_method: "videoconference",
               confirmed_date: confirmed_date.iso8601
             }
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

    it "blocks review staff outside the jurisdiction from scheduling" do
      other_jurisdiction = create(:sub_district, project_meetings_enabled: true)
      other_reviewer =
        create(:user, :reviewer, jurisdiction: other_jurisdiction)
      meeting = create(:project_meeting, :open, permit_project: permit_project)
      confirmed_date = 1.week.from_now
      sign_in other_reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/transition_status",
           params: {
             target_status: "scheduled",
             project_meeting: {
               contact_method: "phone",
               confirmed_date: confirmed_date.iso8601
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings/:id/mark_as_viewed" do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
    let(:meeting) do
      create(:project_meeting, :open, permit_project: permit_project)
    end

    it "marks a meeting request as viewed for review staff" do
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/mark_as_viewed",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(meeting.reload.viewed_at).to be_present
      expect(json_response.dig("data", "viewed_at")).to be_present
    end

    it "blocks project owners" do
      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/mark_as_viewed",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/permit_projects/:permit_project_id/meetings/:id/mark_as_unviewed" do
    let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
    let(:meeting) do
      create(:project_meeting, :open, :viewed, permit_project: permit_project)
    end

    it "marks a meeting request as unviewed for review staff" do
      sign_in reviewer

      post "/api/permit_projects/#{permit_project.id}/meetings/#{meeting.id}/mark_as_unviewed",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(meeting.reload.viewed_at).to be_nil
      expect(json_response.dig("data", "viewed_at")).to be_nil
    end
  end
end
