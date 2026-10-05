require "rails_helper"

RSpec.describe "External API v2 permit projects", type: :request do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let(:permit_application) do
    create(
      :permit_application,
      :newly_submitted,
      jurisdiction: external_api_key.jurisdiction
    )
  end
  let(:permit_project) { permit_application.permit_project }

  def auth_headers(key = external_api_key)
    {
      "Authorization" => "Bearer #{key.token}",
      "Content-Type" => "application/json"
    }
  end

  def get_project(project = permit_project, headers: auth_headers)
    get "/external_api/v2/permit_projects/#{project.id}", headers: headers
  end

  it "returns 401 without an API key" do
    get_project(headers: { "Content-Type" => "application/json" })

    expect(response).to have_http_status(:unauthorized)
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    get_project(headers: auth_headers(v1_key))
    expect(response).to have_http_status(:forbidden)
  end

  describe "GET /external_api/v2/permit_projects/:id" do
    it "returns project identity, state, address, and visible sibling summaries" do
      project = permit_project
      draft = create(:permit_application, permit_project: project)
      revisions =
        create(
          :permit_application,
          :revisions_requested,
          permit_project: project
        )

      get_project

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json).to include(
        "id" => project.id,
        "number" => project.number,
        "title" => project.title,
        "state" => project.state,
        "state_label" =>
          Constants::ExternalApi::PROJECT_STATE_LABELS.fetch(project.state),
        "full_address" => project.full_address,
        "pid" => project.pid,
        "pin" => project.pin
      )
      expect(json).not_to have_key("notes")
      expect(json).not_to have_key("permit_project_collaborations")
      expect(json).not_to have_key("project_documents")

      children = json.fetch("permit_applications")
      expect(children.map { |row| row["id"] }).to contain_exactly(
        permit_application.id,
        revisions.id
      )
      expect(children.map { |row| row["id"] }).not_to include(draft.id)

      submitted_row = children.find { |row| row["id"] == permit_application.id }
      expect(submitted_row).to include(
        "number" => permit_application.number,
        "status" => "newly_submitted",
        "status_label" => "Submitted"
      )
      expect(submitted_row).to have_key("tags")

      revisions_row = children.find { |row| row["id"] == revisions.id }
      expect(revisions_row).to include(
        "status" => "revisions_requested",
        "status_label" => "Revisions requested"
      )
    end

    it "returns 403 for a project in another jurisdiction" do
      other = create(:permit_application, :newly_submitted).permit_project

      get_project(other)

      expect(response).to have_http_status(:forbidden)
    end

    it "returns 404 for a sandbox project when the key is live" do
      sandbox_project =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction,
          sandbox: external_api_key.jurisdiction.sandboxes.first
        ).permit_project

      get_project(sandbox_project)

      expect(response).to have_http_status(:not_found)
    end

    it "returns 403 for a draft-only project" do
      draft_project =
        create(
          :permit_application,
          jurisdiction: external_api_key.jurisdiction
        ).permit_project

      get_project(draft_project)

      expect(response).to have_http_status(:forbidden)
    end
  end
end
