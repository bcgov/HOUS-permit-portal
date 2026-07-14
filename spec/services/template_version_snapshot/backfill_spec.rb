require "rails_helper"

RSpec.describe TemplateVersionSnapshot::Backfill do
  let(:scope) { double("TemplateVersion scope", count: 1) }
  let(:legacy_outline) do
    { "id" => "template-1", "requirement_template_sections" => [] }
  end
  let(:template_version) do
    double(
      "legacy TemplateVersion",
      id: "version-1",
      snapshot_json: nil,
      form_json: {
      },
      denormalized_template_json: legacy_outline,
      requirement_blocks_json: {
      }
    )
  end

  before do
    allow(scope).to receive(:find_each).and_yield(template_version)
    allow(template_version).to receive(:update_columns)
  end

  it "backfills a canonical snapshot and reports coverage" do
    result = described_class.call(scope: scope)

    expect(template_version).to have_received(:update_columns).with(
      snapshot_json:
        hash_including(
          "schema_version" => 1,
          "template" => hash_including("id" => "template-1")
        )
    )
    expect(result.backfilled).to eq(1)
    expect(result.verified).to eq(1)
  end

  it "is idempotent for populated rows" do
    allow(template_version).to receive(:snapshot_json).and_return(
      "schema_version" => 1,
      "template" => {
        "id" => "template-1"
      },
      "sections" => [],
      "blocks" => {
      }
    )

    result = described_class.call(scope: scope)

    expect(template_version).not_to have_received(:update_columns)
    expect(result.backfilled).to eq(0)
  end

  it "rejects rows without the retained compiled form artifact" do
    allow(template_version).to receive(:form_json).and_return(nil)

    expect { described_class.call(scope: scope) }.to raise_error(
      ArgumentError,
      /Unable to backfill TemplateVersion version-1: Compiled form must be a JSON object/
    )
  end
end
