require "rails_helper"
require "sidekiq/testing"

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

  def update_state(state, project: permit_project, headers: auth_headers)
    patch "/external_api/v2/permit_projects/#{project.id}/state",
          params: { state: state }.to_json,
          headers: headers
  end

  def queue_project(project = permit_project)
    project.update_column(:state, PermitProject.states[:queued])
    project.reload
  end

  def stub_permit_project_search(*records)
    allow(PermitProject).to receive(:search) do |_query, **kwargs|
      @permit_project_search_kwargs = kwargs
      relation = PermitProject.where(id: records.map(&:id))
      scoped = kwargs.fetch(:scope_results).call(relation)
      results = scoped.to_a

      double(
        "PermitProjectSearch",
        results: results,
        total_pages: 1,
        total_count: results.size,
        current_page: 1,
        limit_value: 10
      )
    end
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

  describe "POST /external_api/v2/permit_projects/search" do
    it "returns the key's non-draft projects and drops drafts, other jurisdictions, and the wrong sandbox" do
      allowed = queue_project
      draft_only =
        create(
          :permit_application,
          jurisdiction: external_api_key.jurisdiction
        ).permit_project
      other_jurisdiction =
        create(:permit_application, :newly_submitted).permit_project
      other_jurisdiction.update_column(:state, PermitProject.states[:queued])
      sandbox_project =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction,
          sandbox: external_api_key.jurisdiction.sandboxes.first
        ).permit_project
      sandbox_project.update_column(:state, PermitProject.states[:queued])

      stub_permit_project_search(
        allowed,
        draft_only,
        other_jurisdiction,
        sandbox_project
      )

      post "/external_api/v2/permit_projects/search",
           params: {}.to_json,
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(@permit_project_search_kwargs[:where]).to eq(
        jurisdiction_id: external_api_key.jurisdiction_id,
        sandbox_id: external_api_key.sandbox_id,
        discarded: false,
        state: {
          not: "draft"
        }
      )
      expect(@permit_project_search_kwargs[:page]).to eq(1)
      expect(@permit_project_search_kwargs[:per_page]).to eq(
        Kaminari.config.default_per_page
      )
      expect(@permit_project_search_kwargs[:order]).to eq(
        created_at: {
          order: :desc,
          unmapped_type: "long"
        }
      )

      data = JSON.parse(response.body).fetch("data")
      expect(data.map { |row| row["id"] }).to contain_exactly(allowed.id)
      expect(data.first).to include(
        "state" => "queued",
        "state_label" => "Queued"
      )
      expect(
        data.first.fetch("permit_applications").map { |row| row["id"] }
      ).to contain_exactly(permit_application.id)
      expect(JSON.parse(response.body).fetch("meta")).to include(
        "total_count" => 1,
        "current_page" => 1
      )
    end

    it "narrows the jurisdiction inbox to constraints.state unless that state is draft" do
      queue_project
      stub_permit_project_search(permit_project)

      post "/external_api/v2/permit_projects/search",
           params: { constraints: { state: "in_progress" } }.to_json,
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(@permit_project_search_kwargs[:where][:state]).to eq("in_progress")

      post "/external_api/v2/permit_projects/search",
           params: { constraints: { state: "draft" } }.to_json,
           headers: auth_headers

      expect(@permit_project_search_kwargs[:where][:state]).to eq(
        { not: "draft" }
      )
    end
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
      expect(submitted_row).not_to have_key("available_statuses")

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

    it "returns the inbox states a partner may write from queued" do
      queue_project

      get_project

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig("data", "available_states")).to eq(
        %w[waiting in_progress ready permit_issued active closed]
      )
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

  describe "PATCH /external_api/v2/permit_projects/:id/state" do
    it "writes an allowed state, clears inbox order, audits the partner, and emits one webhook" do
      project = queue_project
      project.update!(inbox_sort_order: 4)
      external_api_key.update!(
        webhook_url: "https://partner.example.com/webhook"
      )
      PermitWebhookJob.clear

      update_state("in_progress")

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json["state"]).to eq("in_progress")
      expect(json["available_states"]).to eq(%w[queued waiting ready closed])
      expect(project.reload).to be_in_progress
      expect(project.inbox_sort_order).to be_nil

      audit =
        ApplicationAudit
          .where(
            auditable_type: "PermitProject",
            auditable_id: project.id,
            action: "update"
          )
          .where("audited_changes ? 'state'")
          .order(version: :desc)
          .first
      expect(audit.username).to eq(Constants::ExternalApi::PARTNER_SYSTEM_ACTOR)

      expect(PermitWebhookJob.jobs.length).to eq(1)
      expect(PermitWebhookJob.jobs.first["args"][1]).to eq(
        Constants::Webhooks::Events::PermitProject::STATE_CHANGED
      )
    end

    it "rejects draft and does not change state" do
      project = queue_project

      update_state("draft")

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "waiting, in_progress, ready, permit_issued, active, closed"
      )
      expect(project.reload).to be_queued
    end

    it "accepts the current state without another webhook" do
      project = queue_project
      project.update!(inbox_sort_order: 4)
      external_api_key.update!(
        webhook_url: "https://partner.example.com/webhook"
      )
      PermitWebhookJob.clear

      update_state("queued")

      expect(response).to have_http_status(:ok)
      expect(project.reload).to be_queued
      expect(project.inbox_sort_order).to eq(4)
      expect(PermitWebhookJob.jobs).to be_empty
    end

    it "returns 403 for a project in another jurisdiction" do
      other = create(:permit_application, :newly_submitted).permit_project
      other.update_column(:state, PermitProject.states[:queued])

      update_state("in_progress", project: other)

      expect(response).to have_http_status(:forbidden)
      expect(other.reload).to be_queued
    end

    it "returns 404 for a sandbox project when the key is live" do
      sandbox_project =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction,
          sandbox: external_api_key.jurisdiction.sandboxes.first
        ).permit_project
      sandbox_project.update_column(:state, PermitProject.states[:queued])

      update_state("in_progress", project: sandbox_project)

      expect(response).to have_http_status(:not_found)
      expect(sandbox_project.reload).to be_queued
    end
  end
end
