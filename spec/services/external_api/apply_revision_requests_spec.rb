require "rails_helper"

RSpec.describe ExternalApi::ApplyRevisionRequests do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let(:permit_application) do
    create(
      :permit_application,
      :newly_submitted,
      jurisdiction: external_api_key.jurisdiction
    )
  end
  let(:block_id) { "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }
  let(:requirement_id) { "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }
  let(:block_code) { "site_information" }
  let(:requirement_code) { "site_address" }
  let(:form_key) do
    "formSubmissionDataRSTsection1|RB#{block_id}|#{requirement_code}"
  end
  let!(:revision_reason) do
    RevisionReason.find_or_create_by!(
      reason_code: "inaccurate_documentation"
    ) do |reason|
      reason.site_configuration = SiteConfiguration.instance
      reason.description = "Inaccurate documentation"
    end
  end
  let(:item) do
    {
      "requirement_block_code" => block_code,
      "requirement_code" => requirement_code,
      "reason_code" => revision_reason.reason_code,
      "comment" => "Please fix"
    }
  end

  before do
    permit_application.template_version.update!(
      requirement_blocks_json: {
        block_id => {
          "id" => block_id,
          "sku" => block_code,
          "requirements" => [
            {
              "id" => requirement_id,
              "requirement_code" => requirement_code,
              "form_json" => {
                "key" => form_key
              }
            }
          ]
        }
      }
    )
  end

  def apply(items)
    described_class.new(permit_application, items).call
  end

  def cache_reference_file(filename)
    file = File.open("spec/support/signed_converted.pdf", binmode: true)
    uploaded =
      FileUploader.upload(
        file,
        :cache,
        location: "#{SecureRandom.uuid}/#{filename}"
      )
    uploaded.id
  ensure
    file&.close
  end

  it "stores field revision requests" do
    apply([item])

    request =
      permit_application.latest_submission_version.revision_requests.last
    expect(request).to be_a(FieldRevisionRequest)
  end

  it "stores an applicant note without a user" do
    described_class.new(
      permit_application,
      [item],
      applicant_note: "Please fix the address"
    ).call

    note =
      permit_application.latest_submission_version.notes.applicant_message.first
    expect(note.body).to eq("<p>Please fix the address</p>")
    expect(note.user).to be_nil
  end

  it "rejects a non-string applicant note" do
    expect {
      described_class.new(
        permit_application,
        [item],
        applicant_note: {
          text: "nope"
        }
      ).call
    }.to raise_error(described_class::Error, "applicant_note must be a string.")
  end

  it "rejects the synthetic energy step code block" do
    expect {
      apply([item.merge("requirement_block_code" => "energy_step_code_tool")])
    }.to raise_error(
      described_class::Error,
      "Unknown requirement_block_code 'energy_step_code_tool'."
    )
  end

  it "rejects duplicate field targets" do
    expect { apply([item, item]) }.to raise_error(
      described_class::Error,
      /duplicate requirement_block_code and requirement_code/
    )
  end

  it "stores a document request from a cached reference file" do
    allow(PromoteJob).to receive(:perform_async)
    cache_id = cache_reference_file("site-plan.pdf")

    apply(
      [
        {
          "name" => "Site plan",
          "reason_code" => revision_reason.reason_code,
          "comment" => "a" * 400,
          "reference_document_ids" => [cache_id]
        }
      ]
    )

    request =
      permit_application.latest_submission_version.revision_requests.last
    expect(request).to be_a(SupportingDocumentRevisionRequest)
    expect(request.title).to eq("Site plan")
    expect(request.comment.length).to eq(400)
    expect(request.revision_reference_documents.count).to eq(1)
    expect(request.revision_reference_documents.first.file_name).to eq(
      "site-plan.pdf"
    )
  end

  it "rejects a document request whose reference file is not in the cache" do
    expect {
      apply(
        [
          {
            "name" => "Site plan",
            "reason_code" => revision_reason.reason_code,
            "comment" => "Please provide a current site plan.",
            "reference_document_ids" => [
              "00000000-0000-4000-8000-000000000000/missing.pdf"
            ]
          }
        ]
      )
    }.to raise_error(
      described_class::Error,
      "revision_requests[0] is missing reference_document_ids"
    )
    expect(
      permit_application.latest_submission_version.revision_requests
    ).to be_empty
  end

  it "still rejects a field comment over 350 characters" do
    expect { apply([item.merge("comment" => "a" * 351)]) }.to raise_error(
      described_class::Error,
      /comment exceeds 350 characters/
    )
  end

  it "rejects a discarded reason code" do
    revision_reason.discard!

    expect { apply([item]) }.to raise_error(
      described_class::Error,
      "Unknown reason_code 'inaccurate_documentation'."
    )
  end
end
