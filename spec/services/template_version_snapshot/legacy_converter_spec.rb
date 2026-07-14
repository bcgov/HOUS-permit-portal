require "rails_helper"

RSpec.describe TemplateVersionSnapshot::LegacyConverter do
  let(:outline) do
    {
      "id" => "template-1",
      "nickname" => "Template",
      "description" => "Description",
      "requirement_template_sections" => [
        {
          "id" => "section-1",
          "name" => "Section",
          "template_section_blocks" => [
            {
              "id" => "placement-1",
              "conditional" => {
                "show" => true
              },
              "requirement_block" => {
                "id" => "block-1"
              }
            }
          ]
        }
      ]
    }
  end
  let(:blocks) do
    {
      "block-1" => {
        "id" => "block-1",
        "name" => "Block",
        "form_json" => {
          "components" => []
        },
        "requirement_documents" => [
          { "id" => "document-1", "name" => "Document" }
        ],
        "requirements" => [
          { "id" => "requirement-1", "form_json" => { "type" => "textfield" } }
        ]
      }
    }
  end

  it "converts ordered legacy projections without generated fragments" do
    snapshot =
      described_class.call(
        denormalized_template_json: outline,
        requirement_blocks_json: blocks
      )

    expect(snapshot["schema_version"]).to eq(1)
    expect(snapshot.dig("sections", 0, "blocks", 0)).to include(
      "id" => "placement-1",
      "block_id" => "block-1",
      "position" => 1,
      "conditional" => {
        "show" => true
      }
    )
    expect(snapshot.dig("blocks", "block-1")).not_to have_key("form_json")
    expect(
      snapshot.dig("blocks", "block-1", "requirements", 0)
    ).not_to have_key("form_json")
    expect(
      snapshot.dig("blocks", "block-1", "requirement_documents", 0, "id")
    ).to eq("document-1")
  end

  it "reconstructs the legacy outline and block projections" do
    snapshot =
      described_class.call(
        denormalized_template_json: outline,
        requirement_blocks_json: blocks
      )
    presentation =
      TemplateVersionSnapshot::Presentation.new(
        double("TemplateVersion", snapshot_json: snapshot, form_json: {})
      )

    expect(presentation.summary).to include(
      "id" => outline["id"],
      "nickname" => outline["nickname"],
      "description" => outline["description"]
    )
    expect(
      presentation.outline.dig(
        "requirement_template_sections",
        0,
        "template_section_blocks",
        0,
        "requirement_block"
      )
    ).to eq(presentation.blocks.fetch("block-1"))
  end

  it "fails instead of silently dropping a missing placement block" do
    expect do
      described_class.call(
        denormalized_template_json: outline,
        requirement_blocks_json: {
        }
      )
    end.to raise_error(ArgumentError, /missing blocks: block-1/)
  end
end
