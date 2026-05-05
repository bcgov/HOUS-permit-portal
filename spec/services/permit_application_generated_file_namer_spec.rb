require "rails_helper"

RSpec.describe PermitApplicationGeneratedFileNamer do
  let(:permit_application) do
    instance_double(
      "PermitApplication",
      id: "10a8aab1",
      number: "DSQ-001-000-057"
    )
  end

  subject(:namer) do
    described_class.new(permit_application, date: Date.new(2026, 4, 29))
  end

  it "builds no-space filenames from the permit application number and ISO date" do
    expect(namer.permit_application_pdf(version_number: 1)).to eq(
      "DSQ-001-000-057_2026-04-29_permit-application_v1.pdf"
    )
    expect(namer.step_code_checklist_pdf(version_number: 2)).to eq(
      "DSQ-001-000-057_2026-04-29_step-code-checklist_v2.pdf"
    )
    expect(namer.supporting_documents_zip).to eq(
      "DSQ-001-000-057_2026-04-29_supporting-documents.zip"
    )
    expect(namer.permit_application_json).to eq(
      "DSQ-001-000-057_2026-04-29_permit-application.json"
    )
  end

  it "falls back to the permit application id when number is unavailable" do
    allow(permit_application).to receive(:number).and_return(nil)

    expect(namer.permit_application_pdf(version_number: 1)).to eq(
      "10a8aab1_2026-04-29_permit-application_v1.pdf"
    )
  end
end
