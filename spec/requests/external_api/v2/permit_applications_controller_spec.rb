require "rails_helper"
require "sidekiq/testing"

RSpec.describe "External API v2 permit applications", type: :request do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let(:permit_application) do
    create(
      :permit_application,
      :newly_submitted,
      jurisdiction: external_api_key.jurisdiction
    )
  end

  def auth_headers(key = external_api_key)
    {
      "Authorization" => "Bearer #{key.token}",
      "Content-Type" => "application/json"
    }
  end

  def stub_permit_application_search(*records)
    allow(PermitApplication).to receive(:search) do |_query, **kwargs|
      relation = PermitApplication.where(id: records.map(&:id))
      scoped = kwargs.fetch(:scope_results).call(relation)
      results = scoped.to_a

      double(
        "PermitApplicationSearch",
        results: results,
        total_pages: 1,
        total_count: results.size,
        current_page: 1,
        limit_value: 10
      )
    end
  end

  def update_status(
    status,
    application: permit_application,
    headers: auth_headers
  )
    patch "/external_api/v2/permit_applications/#{application.id}/status",
          params: { status: status }.to_json,
          headers: headers
  end

  describe "POST /external_api/v2/permit_applications/search" do
    it "returns results scoped by policy (jurisdiction + submitted + sandbox)" do
      allowed = permit_application
      disallowed_draft =
        create(:permit_application, jurisdiction: external_api_key.jurisdiction)
      disallowed_other_jurisdiction =
        create(:permit_application, :newly_submitted)

      stub_permit_application_search(
        allowed,
        disallowed_draft,
        disallowed_other_jurisdiction
      )

      post "/external_api/v2/permit_applications/search",
           params: {}.to_json,
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body).fetch("data").map { |row| row["id"] }
      expect(ids).to contain_exactly(allowed.id)
    end
  end

  it "returns 401 without an API key" do
    update_status(
      "in_review",
      headers: {
        "Content-Type" => "application/json"
      }
    )

    expect(response).to have_http_status(:unauthorized)
    expect(permit_application.reload).to be_newly_submitted
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    get "/external_api/v2/permit_applications/#{permit_application.id}",
        headers: auth_headers(v1_key)
    expect(response).to have_http_status(:forbidden)

    get "/external_api/v1/permit_applications/#{permit_application.id}",
        headers: auth_headers
    expect(response).to have_http_status(:forbidden)
  end

  describe "GET /external_api/v2/permit_applications/:id" do
    it "returns a slim application with version index and no submission_data" do
      get "/external_api/v2/permit_applications/#{permit_application.id}",
          headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json).not_to have_key("submission_data")
      expect(json).not_to have_key("raw_h2k_files")
      expect(json).to include(
        "id" => permit_application.id,
        "permit_project_id" => permit_application.permit_project_id,
        "number" => permit_application.number
      )
      expect(json).to have_key("zipfile_url")
      versions = json.fetch("submission_versions")
      expect(versions.length).to eq(1)
      expect(versions.first).to include(
        "id" => permit_application.latest_submission_version.id,
        "version_number" => 1
      )
      expect(versions.first).to have_key("package_ready_at")
    end
  end

  describe "GET /external_api/v2/permit_applications/:id/submission_versions/:submission_version_id" do
    it "returns the frozen version snapshot rather than live form data" do
      version = permit_application.latest_submission_version
      version.update!(
        submission_data: {
          "data" => {
            "s1" => {
              "prefix|RBmissing|field1" => "from-version"
            }
          }
        }
      )
      permit_application.update_columns(
        submission_data: {
          "data" => {
            "s1" => {
              "prefix|RBmissing|field1" => "from-live"
            }
          }
        }
      )

      get "/external_api/v2/permit_applications/#{permit_application.id}/submission_versions/#{version.id}",
          headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json["id"]).to eq(version.id)
      expect(json["permit_application_id"]).to eq(permit_application.id)
      expect(json).to have_key("submission_data")
      expect(json).to have_key("generated_documents")
      expect(json).to have_key("raw_h2k_files")
      expect(json["submission_data"]).to eq({})
    end

    it "returns 404 when the version does not belong to the application" do
      other =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction
        )

      get "/external_api/v2/permit_applications/#{permit_application.id}/submission_versions/#{other.latest_submission_version.id}",
          headers: auth_headers

      expect(response).to have_http_status(:not_found)
    end
  end

  it "updates an allowed status and attributes the audit to the partner" do
    update_status("in_review")

    expect(response).to have_http_status(:ok)
    expect(permit_application.reload).to be_in_review
    expect(JSON.parse(response.body).dig("data", "status")).to eq("in_review")

    audit =
      ApplicationAudit
        .where(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id,
          action: "update"
        )
        .where("audited_changes ? 'status'")
        .last
    expect(audit.username).to eq(Constants::ExternalApi::PARTNER_SYSTEM_ACTOR)
    expect(
      ProjectAuditPresenter.new(
        audit,
        permit_application.submitter
      ).format_description
    ).to eq("Partner system marked the application as in review")
  end

  it "treats a repeated write of the current status as an idempotent success" do
    permit_application.start_review!
    audit_count =
      ApplicationAudit
        .where(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id
        )
        .where("audited_changes ? 'status'")
        .count

    update_status("in_review")

    expect(response).to have_http_status(:ok)
    expect(
      ApplicationAudit
        .where(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id
        )
        .where("audited_changes ? 'status'")
        .count
    ).to eq(audit_count)
  end

  it "emits one generic status webhook after a partner update" do
    permit_application
    external_api_key.update!(webhook_url: "https://partner.example.com/webhook")
    PermitWebhookJob.clear

    update_status("in_review")

    expect(PermitWebhookJob.jobs.length).to eq(1)
    job = PermitWebhookJob.jobs.first
    expect(job["args"][1]).to eq(
      Constants::Webhooks::Events::PermitApplication::STATUS_CHANGED
    )
    expect(job["args"][2]["status"]).to eq("in_review")
  end

  it "rejects BPH-owned and unknown statuses with the frozen write set" do
    %w[newly_submitted revisions_requested not_a_status].each do |status|
      update_status(status)

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "in_review, approved, issued, withdrawn"
      )
    end
    expect(permit_application.reload).to be_newly_submitted
  end

  it "rejects a canonical status that is not a valid lifecycle transition" do
    update_status("approved")

    expect(response).to have_http_status(:unprocessable_content)
    expect(JSON.parse(response.body).dig("meta", "message")).to include(
      "Cannot transition status from 'newly_submitted' to 'approved'"
    )
  end

  it "does not allow a key to update another jurisdiction" do
    other_application = create(:permit_application, :newly_submitted)

    update_status("in_review", application: other_application)

    expect(response).to have_http_status(:forbidden)
    expect(other_application.reload).to be_newly_submitted
  end

  it "does not allow a live key to update a sandbox application" do
    sandbox_application =
      create(
        :permit_application,
        :newly_submitted,
        jurisdiction: external_api_key.jurisdiction,
        sandbox: external_api_key.jurisdiction.sandboxes.first
      )

    update_status("in_review", application: sandbox_application)

    expect(response).to have_http_status(:not_found)
    expect(sandbox_application.reload).to be_newly_submitted
  end
end
