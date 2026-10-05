require "rails_helper"
require "sidekiq/testing"

RSpec.describe ZipfileJob, type: :job do
  before { Sidekiq::Testing.fake! }

  def stub_package_pipeline(pa)
    versions = double("Versions")
    allow(pa).to receive(:submission_versions).and_return(versions)
    allow(versions).to receive(:pluck).with(:id).and_return([])
    allow(pa).to receive(:mark_submission_packages_ready!).and_return([])
  end

  it "locks by permit_application_id" do
    expect(described_class.lock_args(%w[pa1 x])).to eq(["pa1"])
  end

  it "runs pdf generation + zipper and broadcasts update when permit application exists" do
    pdf_job = instance_double("PdfGenerationJob", perform: true)
    allow(PdfGenerationJob).to receive(:new).and_return(pdf_job)

    zipper = instance_double("SupportingDocumentsZipper", perform: true)
    allow(SupportingDocumentsZipper).to receive(:new).with("pa1").and_return(
      zipper
    )

    pa =
      instance_double(
        "PermitApplication",
        notifiable_users: double("UsersRel", pluck: ["u1"]),
        reload: true,
        mark_submission_packages_ready!: [],
        enqueue_package_ready_webhooks: true
      )
    stub_package_pipeline(pa)
    allow(PermitApplication).to receive(:find_by_id).with("pa1").and_return(pa)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return(
      { "p" => 1 }
    )
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)

    described_class.new.perform("pa1")

    expect(pdf_job).to have_received(:perform).with("pa1")
    expect(zipper).to have_received(:perform)
    expect(WebsocketBroadcaster).to have_received(
      :push_update_to_relevant_users
    )
  end

  it "does not broadcast when permit application is missing" do
    allow(PdfGenerationJob).to receive_message_chain(:new, :perform)
    allow(SupportingDocumentsZipper).to receive_message_chain(:new, :perform)
    allow(PermitApplication).to receive(:find_by_id).and_return(nil)
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)

    described_class.new.perform("missing")

    expect(WebsocketBroadcaster).not_to have_received(
      :push_update_to_relevant_users
    )
  end

  it "marks ready versions and enqueues V2 package_ready without file URLs" do
    jurisdiction = create(:sub_district, external_api_state: "j_on")
    v2_key =
      create(
        :external_api_key,
        jurisdiction: jurisdiction,
        api_version: "v2",
        webhook_url: "https://v2.example.com/webhook"
      )
    create(
      :external_api_key,
      jurisdiction: jurisdiction,
      api_version: "v1",
      webhook_url: "https://v1.example.com/webhook"
    )
    permit_application =
      create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)
    permit_application.latest_submission_version.update_columns(
      zipfile_data: {
        "id" => "zip",
        "storage" => "store",
        "metadata" => {
        }
      }
    )
    allow_any_instance_of(SubmissionVersion).to receive(
      :missing_pdfs?
    ).and_return(false)
    allow(PdfGenerationJob).to receive_message_chain(:new, :perform)
    allow(SupportingDocumentsZipper).to receive_message_chain(:new, :perform)
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return({})
    PermitWebhookJob.clear

    described_class.new.perform(permit_application.id)

    version = permit_application.latest_submission_version.reload
    expect(version.package_ready_at).to be_present

    jobs = PermitWebhookJob.jobs
    expect(jobs.length).to eq(1)
    expect(jobs.first["args"][0]).to eq(v2_key.id)
    expect(jobs.first["args"][1]).to eq(
      Constants::Webhooks::Events::PermitApplication::PACKAGE_READY
    )
    payload = jobs.first["args"][2]
    expect(payload).to include(
      "permit_application_id" => permit_application.id,
      "permit_project_id" => permit_application.permit_project_id,
      "submission_version_id" => version.id,
      "number" => permit_application.number
    )
    expect(payload.keys).not_to include("zipfile_url", "submission_data")
  end

  it "does not mark a version ready twice" do
    permit_application = create(:permit_application, :newly_submitted)
    version = permit_application.latest_submission_version
    version.update_columns(
      zipfile_data: {
        "id" => "zip",
        "storage" => "store"
      }
    )
    version.update!(package_ready_at: 1.hour.ago)
    allow_any_instance_of(SubmissionVersion).to receive(
      :missing_pdfs?
    ).and_return(false)
    allow(PdfGenerationJob).to receive_message_chain(:new, :perform)
    allow(SupportingDocumentsZipper).to receive_message_chain(:new, :perform)
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return({})
    PermitWebhookJob.clear

    described_class.new.perform(permit_application.id)

    expect(version.reload.package_ready_at).to be_within(1.second).of(
      1.hour.ago
    )
    expect(PermitWebhookJob.jobs).to be_empty
  end

  it "re-enqueues from after_unlock when a version appeared mid-job" do
    job = described_class.new
    job.instance_variable_set(:@reenqueue, true)
    job.instance_variable_set(:@permit_application_id, "pa1")

    expect(described_class).to receive(:perform_async).with("pa1")
    job.after_unlock
  end
end
