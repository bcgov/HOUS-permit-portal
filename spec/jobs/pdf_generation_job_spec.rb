require "rails_helper"
require "sidekiq/testing"

RSpec.describe PdfGenerationJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "locks by permit_application_id" do
    expect(described_class.lock_args(%w[pa1 other])).to eq(["pa1"])
  end

  it "attaches missing checklist and permit-application PDFs via HtmlPdfService" do
    permit_application =
      instance_double("PermitApplication", id: "pa1", number: "DSQ-001-000-057")
    allow(PermitApplication).to receive(:find).with("pa1").and_return(
      permit_application
    )

    submission_version =
      instance_double(
        "SubmissionVersion",
        id: "sv1",
        version_number: 1,
        missing_pdfs?: true,
        missing_permit_application_pdf?: true,
        missing_step_code_checklist_pdf?: true,
        created_at: Time.zone.local(2026, 4, 29)
      )
    allow(permit_application).to receive(:submission_versions).and_return(
      [submission_version]
    )

    expect_any_instance_of(described_class).to receive(
      :attach_checklist_pdf_to_submission_version!
    ).once
    expect_any_instance_of(described_class).to receive(
      :attach_permit_application_pdf_to_submission_version!
    ).once

    described_class.new.perform("pa1")
  end

  it "skips attachment when PDFs are already present" do
    permit_application = instance_double("PermitApplication", id: "pa1")
    allow(PermitApplication).to receive(:find).with("pa1").and_return(
      permit_application
    )

    submission_version =
      instance_double(
        "SubmissionVersion",
        missing_pdfs?: false,
        missing_permit_application_pdf?: false,
        missing_step_code_checklist_pdf?: false
      )
    allow(permit_application).to receive(:submission_versions).and_return(
      [submission_version]
    )

    expect_any_instance_of(described_class).not_to receive(
      :attach_checklist_pdf_to_submission_version!
    )
    expect_any_instance_of(described_class).not_to receive(
      :attach_permit_application_pdf_to_submission_version!
    )

    described_class.new.perform("pa1")
  end
end
