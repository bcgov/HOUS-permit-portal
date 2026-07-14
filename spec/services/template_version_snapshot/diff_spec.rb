require "rails_helper"

RSpec.describe "canonical template version diffs" do
  let(:template) { create(:requirement_template) }
  let(:section_id) { SecureRandom.uuid }
  let(:block_id) { SecureRandom.uuid }
  let(:snapshot_sections) do
    [
      {
        "id" => section_id,
        "name" => "Project information",
        "position" => 1,
        "blocks" => [
          { "id" => SecureRandom.uuid, "block_id" => block_id, "position" => 1 }
        ]
      }
    ]
  end

  def block(requirements)
    {
      block_id => {
        "id" => block_id,
        "name" => "Project",
        "requirements" => requirements
      }
    }
  end

  def form(*requirements)
    {
      "components" => [
        {
          "id" => section_id,
          "components" => [{ "id" => block_id, "components" => requirements }]
        }
      ]
    }
  end

  it "diffs semantic requirements and indexes compiled components by ID" do
    before_version =
      create(
        :template_version,
        requirement_template: template,
        snapshot_sections: snapshot_sections,
        snapshot_blocks:
          block(
            [
              { "id" => "changed", "label" => "Old label" },
              { "id" => "removed", "label" => "Removed" }
            ]
          ),
        form_json:
          form(
            { "id" => "changed", "key" => "old-key" },
            { "id" => "removed", "key" => "removed-key" }
          )
      )
    after_version =
      create(
        :template_version,
        requirement_template: template,
        snapshot_sections: snapshot_sections,
        snapshot_blocks:
          block(
            [
              { "id" => "changed", "label" => "New label" },
              { "id" => "added", "label" => "Added" }
            ]
          ),
        form_json:
          form(
            { "id" => "changed", "key" => "new-key" },
            { "id" => "added", "key" => "added-key" }
          )
      )

    diff =
      TemplateVersioningService.produce_diff_hash(before_version, after_version)

    expect(diff[:added].first).to include(
      "id" => "added",
      "form_json" => hash_including("key" => "added-key"),
      "diff_section_label" => "Project information"
    )
    expect(diff[:changed].first).to include(
      "id" => "changed",
      "form_json" => hash_including("key" => "new-key")
    )
    expect(diff[:removed].first).to include(
      "id" => "removed",
      "form_json" => hash_including("key" => "removed-key")
    )
  end
end
