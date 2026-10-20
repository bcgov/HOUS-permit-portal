require "rails_helper"

RSpec.describe DigitalSealChecks do
  let(:application) { create(:permit_application) }
  let(:field_key) { "section|RBblock|design_file" }
  let(:requirements) do
    {
      field_key => {
        "computedCompliance" => {
          "module" => "DigitalSealValidator"
        }
      }
    }
  end

  before do
    allow(application).to receive(:requirements_lookups).and_return(
      requirements
    )
  end

  def reference(document)
    {
      "id" => document.file_id,
      "modelId" => document.id,
      "originalName" => "drawing.pdf"
    }
  end

  def save_uploads(*uploads)
    application.update!(
      submission_data: {
        "data" => {
          "section" => {
            field_key => uploads
          }
        }
      }
    )
  end

  def document(data = {})
    create(
      :supporting_document,
      permit_application: application,
      data_key: field_key,
      compliance_data: data
    )
  end

  it "checks every file, including a pending second upload after a finished first one" do
    checked = document("status" => "success", "result" => [])
    pending = document
    save_uploads(reference(checked), reference(pending))
    checks = described_class.new(application)
    expect(checks.summary).to eq(pending_count: 1, failed_count: 0)
    expect(checks.pending_documents.map(&:id)).to eq([pending.id])
    expect(application.automated_compliance_unique_unfilled_modules).to include(
      "DigitalSealValidator"
    )
    expect { checks.snapshot }.to raise_error(described_class::Pending)
  end

  it "ignores removed files and empty optional fields" do
    document
    save_uploads
    expect(described_class.new(application).summary).to eq(
      pending_count: 0,
      failed_count: 0
    )
    expect(described_class.new(application).snapshot).to eq({})
  end

  it "does not accept a result for a replaced upload or another application's document" do
    old = document("status" => "success", "result" => [])
    foreign =
      create(
        :supporting_document,
        data_key: field_key,
        compliance_data: {
          status: "success",
          result: []
        }
      )
    save_uploads(
      reference(old).merge("id" => "replacement.pdf"),
      reference(foreign)
    )
    expect(described_class.new(application).summary[:pending_count]).to eq(2)
    expect(described_class.new(application).pending_documents).to be_empty
  end

  it "handles cached upload IDs after promotion and rejects mismatched field identities" do
    checked = document("status" => "success", "result" => [])
    checked.update_column(
      :file_data,
      checked.file_data.merge(
        "id" => "supporting_document/#{checked.id}/upload-id.pdf"
      )
    )
    save_uploads(reference(checked).merge("id" => "cache/upload-id.pdf"))
    expect(described_class.new(application).summary[:pending_count]).to eq(0)
    checked.update_column(:data_key, "another_file")
    expect(described_class.new(application).summary[:pending_count]).to eq(1)
  end

  it "treats missing documents and incomplete result data as pending" do
    incomplete = document("status" => "success")
    save_uploads(
      reference(incomplete),
      { "id" => "missing.pdf", "modelId" => SecureRandom.uuid }
    )
    expect(described_class.new(application).summary[:pending_count]).to eq(2)
  end

  it "invalidates validation results explicitly bound to a different file" do
    checked =
      document(
        "status" => "success",
        "result" => [],
        "file_id" => "previous.pdf"
      )
    save_uploads(reference(checked))
    expect(described_class.new(application).summary[:pending_count]).to eq(1)
  end

  it "snapshots found, unsigned, and failed outcomes without raw integration errors" do
    signed =
      document(
        "status" => "success",
        "result" => [
          {
            "signerStatus" => {
              "certificateInfo" => {
                "commonName" => "Test Signer",
                "subjectName" => "CN=Test Signer,OU=INSTITUTE - AIBC,MEMBER"
              }
            },
            "signatureTimestamp" => {
              "date" => "2024-09-06T18:26:19Z"
            }
          }
        ]
      )
    unsigned = document("status" => "success", "result" => [])
    failed =
      document("status" => "failed", "error" => "PRIVATE INTEGRATION ERROR")
    save_uploads(reference(signed), reference(unsigned), reference(failed))
    checks = described_class.new(application)
    expect(checks.summary).to eq(pending_count: 0, failed_count: 1)
    results = checks.snapshot.fetch(field_key)
    expect(results.map { |r| r["status"] }).to eq(%w[found not_found failed])
    expect(results.first["signers"].first).to include(
      "name" => "Test Signer",
      "organization" => "INSTITUTE - AIBC",
      "date" => "2024-09-06 11:26:19 PDT"
    )
    expect(results.to_json).not_to include("PRIVATE INTEGRATION ERROR")
  end
end
