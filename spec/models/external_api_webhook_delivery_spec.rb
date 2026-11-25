require "rails_helper"
require "sidekiq/testing"

RSpec.describe "External API webhook delivery", type: :model do
  let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
  let!(:v1_live_key) do
    create(
      :external_api_key,
      jurisdiction: jurisdiction,
      api_version: "v1",
      webhook_url: "https://v1.example.com/webhook"
    )
  end
  let!(:v2_live_key) do
    create(
      :external_api_key,
      jurisdiction: jurisdiction,
      api_version: "v2",
      webhook_url: "https://v2.example.com/webhook"
    )
  end
  let!(:v2_sandbox_key) do
    create(
      :external_api_key,
      jurisdiction: jurisdiction,
      sandbox: jurisdiction.sandboxes.first,
      api_version: "v2",
      webhook_url: "https://sandbox.example.com/webhook"
    )
  end

  before do
    Sidekiq::Testing.fake!
    PermitWebhookJob.clear
  end

  it "preserves the V1 intake event and gives V2 one generic status event" do
    permit_application =
      create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)
    PermitWebhookJob.clear

    permit_application.send_submitted_webhook

    jobs = PermitWebhookJob.jobs
    expect(jobs.length).to eq(2)

    v1_job = jobs.find { |job| job["args"][0] == v1_live_key.id }
    expect(v1_job["args"][1]).to eq(
      Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED
    )
    expect(v1_job["args"][2]).to eq(
      {
        "permit_id" => permit_application.id,
        "submitted_at" => permit_application.submitted_at.as_json
      }
    )

    v2_job = jobs.find { |job| job["args"][0] == v2_live_key.id }
    expect(v2_job["args"][1]).to eq(
      Constants::Webhooks::Events::PermitApplication::STATUS_CHANGED
    )
    expect(v2_job["args"][2]).to include(
      "permit_application_id" => permit_application.id,
      "submission_version_id" =>
        permit_application.latest_submission_version.id,
      "status" => "newly_submitted",
      "status_label" => "Submitted"
    )
  end

  it "captures V2 status changes without sending non-intake events to V1" do
    permit_application =
      create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)
    permit_application.start_review!
    PermitWebhookJob.clear
    permit_application.send_status_changed_webhook

    jobs = PermitWebhookJob.jobs
    expect(jobs.map { |job| job["args"][0] }).to eq([v2_live_key.id])
    expect(jobs.first["args"][1]).to eq(
      Constants::Webhooks::Events::PermitApplication::STATUS_CHANGED
    )
    expect(jobs.first["args"][2]).to include(
      "permit_project_id" => permit_application.permit_project_id,
      "status" => "in_review",
      "status_label" => "In review",
      "occurred_at" => permit_application.updated_at.to_i * 1000
    )
    expect(jobs.map { |job| job["args"][1] }).not_to include(
      Constants::Webhooks::Events::PermitApplication::PERMIT_RESUBMITTED
    )

    permit_application.update_columns(
      status: PermitApplication.statuses[:approved]
    )
    permit_application.reload
    PermitWebhookJob.clear
    permit_application.send_status_changed_webhook

    expect(PermitWebhookJob.jobs.map { |job| job["args"][2]["status"] }).to eq(
      %w[approved]
    )
    expect(PermitWebhookJob.jobs.map { |job| job["args"][0] }).to eq(
      [v2_live_key.id]
    )
  end

  it "fans V2 sandbox events out only to the matching sandbox key" do
    permit_application =
      create(
        :permit_application,
        jurisdiction: jurisdiction,
        sandbox: v2_sandbox_key.sandbox
      )
    create(:submission_version, permit_application: permit_application)
    permit_application.update_columns(
      status: PermitApplication.statuses[:newly_submitted]
    )
    permit_application.reload
    PermitWebhookJob.clear
    permit_application.send_status_changed_webhook

    expect(PermitWebhookJob.jobs.map { |job| job["args"][0] }).to eq(
      [v2_sandbox_key.id]
    )
  end

  it "does not emit package_ready from the status webhook path" do
    permit_application =
      create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)
    PermitWebhookJob.clear
    permit_application.send_status_changed_webhook

    expect(PermitWebhookJob.jobs.map { |job| job["args"][1] }).not_to include(
      Constants::Webhooks::Events::PermitApplication::PACKAGE_READY
    )
  end

  it "emits project state changes only to matching V2 keys" do
    permit_application =
      create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)
    project = permit_application.permit_project.reload
    project.update_column(:state, PermitProject.states[:in_progress])
    project.reload
    PermitWebhookJob.clear
    project.send(:send_state_changed_webhook)

    expect(PermitWebhookJob.jobs.length).to eq(1)
    key_id, event_type, payload = PermitWebhookJob.jobs.first["args"]
    expect(key_id).to eq(v2_live_key.id)
    expect(event_type).to eq(
      Constants::Webhooks::Events::PermitProject::STATE_CHANGED
    )
    expect(payload).to eq(
      {
        "permit_project_id" => project.id,
        "state" => "in_progress",
        "state_label" => "In progress",
        "occurred_at" => project.updated_at.to_i * 1000
      }
    )
  end

  it "emits project_meeting_requested to the matching V2 key when a request is submitted" do
    create(
      :external_api_key,
      jurisdiction: jurisdiction,
      api_version: "v2",
      webhook_url: nil
    )
    project = create(:permit_project, jurisdiction: jurisdiction)
    meeting = create(:project_meeting, permit_project: project)
    expect(project.permit_applications).to be_empty
    PermitWebhookJob.clear

    meeting.submit_request!

    expect(PermitWebhookJob.jobs.length).to eq(1)
    key_id, event_type, payload = PermitWebhookJob.jobs.first["args"]
    expect(key_id).to eq(v2_live_key.id)
    expect(event_type).to eq(
      Constants::Webhooks::Events::ProjectMeeting::REQUESTED
    )
    expect(payload).to eq(
      {
        "project_meeting_id" => meeting.id,
        "permit_project_id" => project.id,
        "status" => "open",
        "occurred_at" => meeting.submitted_at.to_i * 1000
      }
    )
    expect(payload.to_json).not_to include("http")
  end

  it "emits a sandbox meeting request only to the matching sandbox key" do
    project =
      create(
        :permit_project,
        jurisdiction: jurisdiction,
        sandbox: v2_sandbox_key.sandbox
      )
    meeting = create(:project_meeting, permit_project: project)
    PermitWebhookJob.clear

    meeting.submit_request!

    expect(PermitWebhookJob.jobs.map { |job| job["args"][0] }).to eq(
      [v2_sandbox_key.id]
    )
  end

  it "does not emit project_meeting_requested for draft saves or later meeting transitions" do
    project = create(:permit_project, jurisdiction: jurisdiction)
    meeting = create(:project_meeting, permit_project: project)
    PermitWebhookJob.clear

    meeting.update!(project_description: "Still a draft")
    expect(PermitWebhookJob.jobs).to be_empty

    meeting.submit_request!
    PermitWebhookJob.clear

    meeting.update!(contact_method: :phone, confirmed_date: 1.week.from_now)
    meeting.schedule!
    expect(PermitWebhookJob.jobs).to be_empty

    meeting.update!(confirmed_date: 2.weeks.from_now)
    expect(PermitWebhookJob.jobs).to be_empty

    meeting.complete!
    expect(PermitWebhookJob.jobs).to be_empty

    open_meeting =
      create(
        :project_meeting,
        :open,
        permit_project: create(:permit_project, jurisdiction: jurisdiction)
      )
    PermitWebhookJob.clear
    open_meeting.withdraw!
    expect(PermitWebhookJob.jobs).to be_empty
  end
end
