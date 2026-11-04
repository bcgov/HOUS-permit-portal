require "rails_helper"

RSpec.describe "External API v2 project meetings", type: :request do
  include ActiveSupport::Testing::TimeHelpers
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let(:permit_project) do
    create(:permit_project, jurisdiction: external_api_key.jurisdiction)
  end
  let(:project_meeting) do
    create(:project_meeting, :open, permit_project: permit_project)
  end

  def auth_headers(key = external_api_key)
    {
      "Authorization" => "Bearer #{key.token}",
      "Content-Type" => "application/json"
    }
  end

  def get_meeting(meeting = project_meeting, headers: auth_headers)
    get "/external_api/v2/project_meetings/#{meeting.id}", headers: headers
  end

  def accept_meeting(body, meeting: project_meeting, headers: auth_headers)
    patch "/external_api/v2/project_meetings/#{meeting.id}",
          params: body.to_json,
          headers: headers
  end

  def phone_schedule
    { confirmed_date: 1.week.from_now.iso8601, contact_method: "phone" }
  end

  it "returns 401 without an API key" do
    get_meeting(headers: { "Content-Type" => "application/json" })

    expect(response).to have_http_status(:unauthorized)
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    get_meeting(headers: auth_headers(v1_key))
    expect(response).to have_http_status(:forbidden)
  end

  describe "GET /external_api/v2/project_meetings/:id" do
    it "returns the request, project identity, and signed document URLs" do
      supporting =
        create(
          :meeting_request_document,
          project_meeting: project_meeting,
          document_type: :supporting
        )
      authorization =
        create(
          :meeting_request_document,
          :authorization,
          project_meeting: project_meeting
        )

      get_meeting

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json).to include(
        "id" => project_meeting.id,
        "status" => "open",
        "requester_relationship" => project_meeting.requester_relationship,
        "contact_name" => project_meeting.contact_name,
        "contact_email" => project_meeting.contact_email,
        "contact_phone_number" => project_meeting.contact_phone_number,
        "project_description" => project_meeting.project_description,
        "request_property_information" =>
          project_meeting.request_property_information,
        "permit_project_id" => permit_project.id,
        "project_number" => permit_project.number,
        "project_address" => permit_project.full_address,
        "project_pid" => permit_project.pid
      )
      expect(json).not_to have_key("meeting_notes")
      documents = json.fetch("meeting_request_documents")
      expect(
        documents.map { |document| document["document_type"] }
      ).to contain_exactly("supporting", "authorization")
      expect(documents.map { |document| document["id"] }).to contain_exactly(
        supporting.id,
        authorization.id
      )
      expect(documents.map { |document| document["url"] }).to all(be_present)
    end

    it "returns a new download URL on a later GET" do
      create(:meeting_request_document, project_meeting: project_meeting)
      allow_any_instance_of(Shrine::Storage::FileSystem).to receive(:url) {
        "https://files.example/3600/#{Time.current.to_i}"
      }

      get_meeting
      expect(response).to have_http_status(:ok)
      first_url =
        JSON.parse(response.body).dig(
          "data",
          "meeting_request_documents",
          0,
          "url"
        )

      travel 2.hours do
        get_meeting
        expect(response).to have_http_status(:ok)
        second_url =
          JSON.parse(response.body).dig(
            "data",
            "meeting_request_documents",
            0,
            "url"
          )

        expect(second_url).not_to eq(first_url)
        expect(second_url).to start_with("https://files.example/3600/")
      end
      expect(first_url).to start_with("https://files.example/3600/")
    end

    it "returns 403 for a meeting in another jurisdiction" do
      other = create(:project_meeting, :open)

      get_meeting(other)

      expect(response).to have_http_status(:forbidden)
    end

    it "returns 404 for a sandbox meeting when the key is live" do
      sandbox_meeting =
        create(
          :project_meeting,
          :open,
          permit_project:
            create(
              :permit_project,
              jurisdiction: external_api_key.jurisdiction,
              sandbox: external_api_key.jurisdiction.sandboxes.first
            )
        )

      get_meeting(sandbox_meeting)

      expect(response).to have_http_status(:not_found)
    end

    it "returns 403 for a draft" do
      draft = create(:project_meeting, permit_project: permit_project)

      get_meeting(draft)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /external_api/v2/project_meetings/:id" do
    it "schedules an open meeting by phone and notifies the requester" do
      expect { accept_meeting(phone_schedule) }.to have_enqueued_mail(
        PermitHubMailer,
        :notify_project_meeting_scheduled
      ).with(project_meeting)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json["status"]).to eq("scheduled")
      expect(json["contact_method"]).to eq("phone")
      expect(project_meeting.reload).to be_scheduled

      audit =
        ApplicationAudit
          .where(
            auditable_type: "ProjectMeeting",
            auditable_id: project_meeting.id
          )
          .where("audited_changes ? 'status'")
          .last
      expect(audit.username).to eq(Constants::ExternalApi::PARTNER_SYSTEM_ACTOR)
    end

    it "returns 422 for videoconference without a meeting url and stays open" do
      accept_meeting(
        {
          confirmed_date: 1.week.from_now.iso8601,
          contact_method: "videoconference"
        }
      )

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "Meeting url"
      )
      expect(project_meeting.reload).to be_open
      expect(project_meeting.contact_method).to be_nil
    end

    it "returns 422 for an invalid meeting url and stays open" do
      accept_meeting(phone_schedule.merge(meeting_url: "not-a-url"))

      expect(response).to have_http_status(:unprocessable_content)
      expect(project_meeting.reload).to be_open
    end

    it "returns 422 for an unknown contact method and stays open" do
      accept_meeting(phone_schedule.merge(contact_method: "fax"))

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to eq(
        "Contact method is invalid."
      )
      expect(project_meeting.reload).to be_open
    end

    %i[scheduled completed withdrawn].each do |status|
      it "returns 422 for a #{status} meeting and does not change it" do
        meeting =
          create(:project_meeting, status, permit_project: permit_project)
        snapshot = meeting.reload.attributes

        accept_meeting(phone_schedule, meeting: meeting)

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body).dig("meta", "message")).to eq(
          "Meeting request must be open to schedule."
        )
        expect(meeting.reload.attributes).to eq(snapshot)
      end
    end
  end
end
