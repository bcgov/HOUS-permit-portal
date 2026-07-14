require "rails_helper"

RSpec.describe TemplateVersionSnapshot::Builder do
  subject(:artifacts) { described_class.call(requirement_template) }

  let(:requirement_template) do
    create(:live_full_requirement_template, sections_count: 1)
  end

  it "builds one canonical v1 snapshot and one compiled form artifact" do
    snapshot = artifacts.fetch(:snapshot_json)
    section = requirement_template.requirement_template_sections.first
    section_block = section.template_section_blocks.first

    expect(snapshot).to include(
      "schema_version" => 1,
      "template" =>
        hash_including(
          "id" => requirement_template.id,
          "nickname" => requirement_template.nickname
        )
    )
    snapshot_section = snapshot.fetch("sections").first
    expect(snapshot_section["id"]).to eq(section.id)
    expect(snapshot_section.fetch("blocks")).to include(
      hash_including(
        "id" => section_block.id,
        "block_id" => section_block.requirement_block_id
      )
    )
    expect(artifacts.fetch(:form_json)).to eq(requirement_template.to_form_json)
  end

  it "captures artifacts from a fresh relational graph" do
    RequirementTemplate.where(id: requirement_template.id).update_all(
      nickname: "Fresh database nickname"
    )

    expect(artifacts.dig(:snapshot_json, "template", "nickname")).to eq(
      "Fresh database nickname"
    )
  end

  it "keeps generated form fragments and live visibility policy out of the snapshot" do
    block =
      requirement_template
        .requirement_template_sections
        .first
        .requirement_blocks
        .first
    block.update!(hide_in_early_access: true)

    snapshot_block =
      artifacts.fetch(:snapshot_json).fetch("blocks").fetch(block.id)

    expect(snapshot_block).not_to have_key("form_json")
    expect(snapshot_block).not_to have_key("hide_in_early_access")
    expect(snapshot_block.fetch("requirements")).to all(
      satisfy { |requirement| requirement.exclude?("form_json") }
    )
  end

  it "rejects compiled forms that omit snapshot requirements" do
    allow(requirement_template.class).to receive(:find).with(
      requirement_template.id
    ).and_return(requirement_template)
    allow(requirement_template).to receive(:to_form_json).and_return(
      "components" => []
    )

    expect { artifacts }.to raise_error(
      ArgumentError,
      /Compiled form is missing snapshot requirements/
    )
  end
end
