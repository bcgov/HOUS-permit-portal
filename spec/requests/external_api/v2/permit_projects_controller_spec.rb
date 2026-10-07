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

  def post_drafts(
    permit_applications,
    project: permit_project,
    headers: auth_headers
  )
    post "/external_api/v2/permit_projects/#{project.id}/permit_applications",
         params: { permit_applications: permit_applications }.to_json,
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

  describe "POST /external_api/v2/permit_projects/:id/permit_applications" do
    # The submitted application is a lazy let. Load it before change matchers,
    # or the first reference inside post_drafts looks like a created draft.
    before { permit_project }

    def published_template_version
      create(
        :template_version,
        status: :published,
        requirement_template: create(:requirement_template)
      )
    end

    it "creates new_draft applications for the project owner and enqueues autopopulate" do
      low_residential = published_template_version
      laneway = published_template_version
      other_jurisdiction = create(:sub_district)
      state_before = permit_project.state
      external_api_key.update!(
        webhook_url: "https://partner.example.com/webhook"
      )
      PermitWebhookJob.clear
      AutomatedCompliance::AutopopulateJob.clear

      expect do
        post_drafts(
          [
            {
              requirement_template_id: low_residential.requirement_template_id,
              template_version_id: SecureRandom.uuid,
              jurisdiction_id: other_jurisdiction.id,
              sandbox_id: SecureRandom.uuid
            },
            { requirement_template_id: laneway.requirement_template_id }
          ]
        )
      end.to change(PermitApplication, :count).by(2)

      expect(response).to have_http_status(:ok)
      created =
        permit_project.permit_applications.where.not(id: permit_application.id)
      rows = JSON.parse(response.body).fetch("data")
      expect(rows.map { |row| row["id"] }).to match_array(created.map(&:id))
      published_version_ids = {
        low_residential.requirement_template_id => low_residential.id,
        laneway.requirement_template_id => laneway.id
      }

      rows.each do |row|
        application = created.find(row["id"])
        expect(row).to include(
          "number" => application.number,
          "status" => "new_draft",
          "permit_project_id" => permit_project.id
        )
        expect(row).not_to have_key("tags")
        expect(row["template_version"]).to include(
          "id" => application.template_version_id,
          "status" => "published",
          "requirement_template_id" =>
            application.template_version.requirement_template_id,
          "feedbacks_count" => 0,
          "has_unresolved_feedbacks" => false,
          "template_sort_order" =>
            application.template_version.requirement_template.sort_order,
          "template_category_id" => nil,
          "template_category" => nil
        )
        expect(application).to be_new_draft
        expect(application.submitter_id).to eq(permit_project.owner_id)
        expect(application.sandbox_id).to eq(permit_project.sandbox_id)
        expect(application.jurisdiction_id).to eq(
          permit_project.jurisdiction_id
        )
        expect(application.created_by).to eq(permit_project.jurisdiction)
        expect(application.template_version_id).to eq(
          published_version_ids[
            application.template_version.requirement_template_id
          ]
        )
      end

      audits =
        ApplicationAudit.where(
          auditable_type: "PermitApplication",
          auditable_id: created.map(&:id),
          action: "create"
        )
      expect(audits.size).to eq(2)
      expect(audits.map(&:username).uniq).to eq(
        [Constants::ExternalApi::PARTNER_SYSTEM_ACTOR]
      )
      expect(
        AutomatedCompliance::AutopopulateJob.jobs.map do |job|
          job["args"].first
        end
      ).to match_array(created.map(&:id))

      expect(permit_project.reload.state).to eq(state_before)
      state_events =
        PermitWebhookJob.jobs.select do |job|
          job["args"][1] ==
            Constants::Webhooks::Events::PermitProject::STATE_CHANGED
        end
      expect(state_events).to be_empty

      get_project

      expect(response).to have_http_status(:ok)
      child_ids =
        JSON
          .parse(response.body)
          .dig("data", "permit_applications")
          .map { |row| row["id"] }
      expect(child_ids).to include(permit_application.id)
      expect(child_ids & created.map(&:id)).to be_empty
    end

    it "returns 422 and creates nothing when one requirement template is unknown" do
      valid = published_template_version
      unknown_id = SecureRandom.uuid

      expect do
        post_drafts(
          [
            { requirement_template_id: valid.requirement_template_id },
            { requirement_template_id: unknown_id }
          ]
        )
      end.not_to change(PermitApplication, :count)

      expect(response).to have_http_status(:unprocessable_content)
      message = JSON.parse(response.body).dig("meta", "message")
      expect(message).to include(unknown_id)
      expect(message).not_to include(valid.requirement_template_id)
    end

    it "returns 422 and creates nothing when the template has no published version" do
      draft_version =
        create(
          :template_version,
          status: :draft,
          requirement_template: create(:requirement_template)
        )

      expect do
        post_drafts(
          [{ requirement_template_id: draft_version.requirement_template_id }]
        )
      end.not_to change(PermitApplication, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        draft_version.requirement_template_id
      )
    end

    it "returns 422 and creates nothing when the requirement template is discarded" do
      template = create(:requirement_template)
      create(
        :template_version,
        status: :published,
        requirement_template: template
      )
      template.update_column(:discarded_at, Time.current)

      expect do
        post_drafts([{ requirement_template_id: template.id }])
      end.not_to change(PermitApplication, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        template.id
      )
    end

    it "returns 422 for an empty permit_applications array" do
      expect { post_drafts([]) }.not_to change(PermitApplication, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "empty"
      )
    end

    it "returns 403 for a project in another jurisdiction" do
      other = create(:permit_application, :newly_submitted).permit_project
      version = published_template_version

      expect do
        post_drafts(
          [{ requirement_template_id: version.requirement_template_id }],
          project: other
        )
      end.not_to change(PermitApplication, :count)

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
      version = published_template_version

      expect do
        post_drafts(
          [{ requirement_template_id: version.requirement_template_id }],
          project: sandbox_project
        )
      end.not_to change(PermitApplication, :count)

      expect(response).to have_http_status(:not_found)
    end

    it "returns 403 for a draft-only project" do
      draft_project =
        create(
          :permit_application,
          jurisdiction: external_api_key.jurisdiction
        ).permit_project
      version = published_template_version

      expect do
        post_drafts(
          [{ requirement_template_id: version.requirement_template_id }],
          project: draft_project
        )
      end.not_to change(PermitApplication, :count)

      expect(response).to have_http_status(:forbidden)
    end
  end
end
