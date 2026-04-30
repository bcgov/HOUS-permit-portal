require "rails_helper"

RSpec.describe SupportingDocument, type: :model do
  it { should belong_to(:permit_application) }

  describe "generated document filenames" do
    let(:permit_application) do
      instance_double("PermitApplication", id: "pa1", number: "DSQ-001-000-057")
    end
    let(:submission_version) do
      instance_double(
        "SubmissionVersion",
        version_number: 1,
        created_at: Time.zone.local(2026, 4, 29)
      )
    end

    it "uses readable names for generated permit application PDFs" do
      document =
        described_class.new(
          data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY,
          file_data: {
            "id" => "store/generated-guid.pdf",
            "metadata" => {
              "filename" => "permit_application_guid_v1.pdf"
            }
          }
        )
      allow(document).to receive(:permit_application).and_return(
        permit_application
      )
      allow(document).to receive(:submission_version).and_return(
        submission_version
      )
      allow(document).to receive(:file_available?).and_return(true)

      expect(document.file_name).to eq(
        "DSQ-001-000-057_2026-04-29_permit-application_v1.pdf"
      )
      expect(document.standardized_filename).to eq(
        "DSQ-001-000-057_2026-04-29_permit-application_v1.pdf"
      )
    end

    it "uses readable names for generated step code checklist PDFs" do
      document =
        described_class.new(
          data_key: SupportingDocument::CHECKLIST_PDF_DATA_KEY,
          file_data: {
            "id" => "store/generated-guid.pdf",
            "metadata" => {
              "filename" => "step_code_checklist_guid_v1.pdf"
            }
          }
        )
      allow(document).to receive(:permit_application).and_return(
        permit_application
      )
      allow(document).to receive(:submission_version).and_return(
        submission_version
      )
      allow(document).to receive(:file_available?).and_return(true)

      expect(document.file_name).to eq(
        "DSQ-001-000-057_2026-04-29_step-code-checklist_v1.pdf"
      )
      expect(document.standardized_filename).to eq(
        "DSQ-001-000-057_2026-04-29_step-code-checklist_v1.pdf"
      )
    end
  end
end
