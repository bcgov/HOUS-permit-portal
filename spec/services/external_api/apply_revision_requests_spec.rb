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

  it "rejects a discarded reason code" do
    revision_reason.discard!

    expect { apply([item]) }.to raise_error(
      described_class::Error,
      "Unknown reason_code 'inaccurate_documentation'."
    )
  end
end
