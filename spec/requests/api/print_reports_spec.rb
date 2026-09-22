require "rails_helper"

RSpec.describe "Print report data", type: :request do
  include Devise::Test::IntegrationHelpers
  let(:user) { create(:user, :submitter) }
  let(:application) { create(:permit_application, submitter: user) }
  let(:schema) do
    {
      "components" => [
        {
          "type" => "textfield",
          "key" => "answer",
          "label" => "Original question",
          "input" => true
        }
      ]
    }
  end
  let!(:version) do
    create(
      :submission_version,
      permit_application: application,
      form_json: schema,
      submission_data: {
        "data" => {
          "answer" => "Historical answer"
        }
      },
      created_at: 2.days.ago
    )
  end

  before do
    sign_in user
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
    allow(SiteConfiguration).to receive(:qa_tools_enabled?).and_return(true)
  end

  def report_data
    response.parsed_body.fetch("data")
  end

  it "returns saved schema and answers without modifying the record or enqueueing jobs" do
    before = [
      application.reload.attributes,
      version.reload.attributes,
      SupportingDocument.count
    ]
    expect do
      get "/api/permit_applications/#{application.id}/print_report",
          params: {
            submission_version_id: version.id
          }
    end.not_to change { Sidekiq::Queues["file_processing"].size }
    expect(response).to have_http_status(:ok)
    expect(report_data["form_json"]).to eq(schema)
    expect(report_data.dig("submission_data", "data", "answer")).to eq(
      "Historical answer"
    )
    expect(
      [
        application.reload.attributes,
        version.reload.attributes,
        SupportingDocument.count
      ]
    ).to eq(before)
  end

  it "defaults to the latest saved submission and can still select an earlier one" do
    latest =
      create(
        :submission_version,
        permit_application: application,
        form_json: schema,
        submission_data: {
          "data" => {
            "answer" => "New answer"
          }
        }
      )
    get "/api/permit_applications/#{application.id}/print_report"
    expect(report_data.dig("identity", "submission_version_id")).to eq(
      latest.id
    )
    get "/api/permit_applications/#{application.id}/print_report",
        params: {
          submission_version_id: version.id
        }
    expect(report_data.dig("submission_data", "data", "answer")).to eq(
      "Historical answer"
    )
  end

  it "rejects another application's version" do
    other = create(:submission_version)
    get "/api/permit_applications/#{application.id}/print_report",
        params: {
          submission_version_id: other.id
        }
    expect(response).to have_http_status(:not_found)
  end

  it "does not replace a missing historical schema with today's form" do
    version.update_columns(form_json: nil)
    get "/api/permit_applications/#{application.id}/print_report",
        params: {
          submission_version_id: version.id
        }
    expect(response).to have_http_status(:not_found)
  end

  it "keeps all report fields for an authorized jurisdiction reviewer" do
    reviewer = create(:user, :review_manager)
    create(
      :jurisdiction_membership,
      user: reviewer,
      jurisdiction: application.jurisdiction
    )
    application.update_columns(status: PermitApplication.statuses[:resubmitted])
    schema["components"][0]["key"] = "section|RBprivate|answer"
    version.update_columns(
      form_json: schema,
      submission_data: {
        "data" => {
          "section" => {
            "section|RBprivate|answer" => "Full reviewer answer"
          }
        }
      }
    )
    sign_in reviewer
    get "/api/permit_applications/#{application.id}/print_report"
    expect(response).to have_http_status(:ok)
    expect(report_data["form_json"]).to eq(schema)
    expect(
      report_data.dig(
        "submission_data",
        "data",
        "section",
        "section|RBprivate|answer"
      )
    ).to eq("Full reviewer answer")
  end

  it "denies unrelated users" do
    sign_in create(:user, :submitter)
    get "/api/permit_applications/#{application.id}/print_report"
    expect(response).to have_http_status(:forbidden)
  end

  it "hides preview APIs when QA is disabled" do
    allow(SiteConfiguration).to receive(:qa_tools_enabled?).and_return(false)
    get "/api/permit_applications/#{application.id}/print_report"
    expect(response).to have_http_status(:not_found)
  end

  it "rejects missing associated checklist snapshots" do
    # Authorize both the application and the associated step-code resource.
    step_code = create(:part_9_step_code, creator: user)
    step_code.update_columns(permit_application_id: application.id)
    get "/api/permit_applications/#{application.id}/step_code_print_report",
        params: {
          submission_version_id: version.id
        }
    expect(response).to have_http_status(:not_found)
    expect(step_code).to be_persisted
  end

  it "uses the stored checklist snapshot, not a changed current checklist" do
    step = create(:part_9_step_code, creator: user)
    step.update_columns(permit_application_id: application.id)
    snapshot =
      step
        .checklist_blueprint
        .render_as_hash(step.current_checklist, view: :extended)
        .deep_stringify_keys
    snapshot["plan_author"] = "Historical plan author"
    version.update_columns(step_code_checklist_json: snapshot)
    step.update_columns(plan_author: "Current plan author")
    get "/api/permit_applications/#{application.id}/step_code_print_report",
        params: {
          submission_version_id: version.id
        }
    expect(response).to have_http_status(:ok)
    expect(report_data.dig("checklist", "plan_author")).to eq(
      "Historical plan author"
    )
    expect(step.reload.plan_author).to eq("Current plan author")
  end

  it "uses the stored application elective settings with saved version schema and answers" do
    schema["components"][0].merge!(
      "id" => "enabled",
      "elective" => true,
      "customConditional" => "show = true;show = false"
    )
    schema["components"] = [
      { "id" => "block", "components" => schema["components"] }
    ]
    version.update_columns(form_json: schema)
    application.update_columns(
      status: "resubmitted",
      form_customizations_snapshot: {
        "requirement_block_changes" => {
          "block" => {
            "enabled_elective_field_ids" => ["enabled"]
          }
        }
      }
    )
    before = [
      application.reload.attributes,
      version.reload.attributes,
      SupportingDocument.count
    ]
    expect do
      get "/api/permit_applications/#{application.id}/print_report",
          params: {
            submission_version_id: version.id
          }
    end.not_to have_enqueued_job
    expect(response).to have_http_status(:ok)
    field = report_data.dig("form_json", "components", 0, "components", 0)
    expect(field["customConditional"]).to eq("show = true")
    expect(field["label"]).to eq("Original question")
    expect(report_data.dig("submission_data", "data", "answer")).to eq(
      "Historical answer"
    )
    expect(
      [
        application.reload.attributes,
        version.reload.attributes,
        SupportingDocument.count
      ]
    ).to eq(before)
  end

  it "requires authentication" do
    sign_out user
    get "/api/permit_applications/#{application.id}/print_report"
    expect(response).to have_http_status(:unauthorized)
  end

  it "selects only checklists belonging to the requested step code" do
    step_code = create(:part_9_step_code, creator: user)
    other = create(:part_9_step_code, creator: user)
    get "/api/part_9_step_codes/#{step_code.id}/print_report",
        params: {
          checklist_id: other.current_checklist.id
        }
    expect(response).to have_http_status(:not_found)
  end
end

RSpec.describe PrintReports::Data do
  let(:user) { create(:user, :submitter) }

  it "renders saved drafts and applies enabled elective semantics without writes" do
    application = create(:permit_application, submitter: user)
    schema = {
      "components" => [
        {
          "id" => "block",
          "components" => [
            {
              "id" => "enabled",
              "key" => "a",
              "input" => true,
              "type" => "textfield",
              "elective" => true,
              "customConditional" => "show = true;show = false"
            },
            {
              "id" => "disabled",
              "key" => "b",
              "input" => true,
              "type" => "textfield",
              "elective" => true,
              "customConditional" => "show = true;show = false"
            }
          ]
        }
      ]
    }
    allow(application).to receive(:form_json).and_return(schema)
    allow(application).to receive(:form_customizations).and_return(
      {
        "requirement_block_changes" => {
          "block" => {
            "enabled_elective_field_ids" => ["enabled"]
          }
        }
      }
    )
    result = described_class.new(user).application(application)
    fields = result[:form_json]["components"][0]["components"]
    expect(result[:identity][:status]).to eq("Draft")
    expect(fields[0]["customConditional"]).to eq("show = true")
    expect(fields[1]["customConditional"]).to end_with(";show = false")
    expect(
      schema["components"][0]["components"][0]["customConditional"]
    ).to end_with(";show = false")
  end

  it "filters unassigned requirement blocks from report schema" do
    application = create(:permit_application, submitter: user)
    schema = {
      "components" => [
        { "key" => "section|RBallowed", "components" => [] },
        { "key" => "section|RBprivate", "components" => [] }
      ]
    }
    allow(application).to receive(:form_json).and_return(schema)
    allow(application).to receive(
      :submission_requirement_block_edit_permissions
    ).and_return(["allowed"])
    result = described_class.new(user).application(application)
    expect(result[:form_json]["components"].map { |c| c["key"] }).to eq(
      ["section|RBallowed"]
    )
  end

  it "serializes standalone Part 9 without writes or generation" do
    step = create(:part_9_step_code, creator: user)
    snapshots = [
      step.reload.attributes,
      step.current_checklist.reload.attributes
    ]
    result = described_class.new(user).step_code(step)
    expect(result[:kind]).to eq("part9")
    expect(result[:identity][:checklist_id]).to eq(step.current_checklist.id)
    expect(
      [step.reload.attributes, step.current_checklist.reload.attributes]
    ).to eq(snapshots)
    FileUtils.mkdir_p(Rails.root.join("tmp/print-report-fixtures"))
    File.write(
      Rails.root.join("tmp/print-report-fixtures/part9.json"),
      result.to_json
    )
  end

  it "serializes standalone Part 3 without writes or generation" do
    step = create(:part_3_step_code, creator: user)
    snapshots = [
      step.reload.attributes,
      step.current_checklist.reload.attributes
    ]
    result = described_class.new(user).step_code(step)
    expect(result[:kind]).to eq("part3")
    expect(result[:identity][:checklist_id]).to eq(step.current_checklist.id)
    expect(
      [step.reload.attributes, step.current_checklist.reload.attributes]
    ).to eq(snapshots)
    FileUtils.mkdir_p(Rails.root.join("tmp/print-report-fixtures"))
    File.write(
      Rails.root.join("tmp/print-report-fixtures/part3.json"),
      result.to_json
    )
  end
end
