require "rails_helper"

RSpec.describe TemplateCategorySeeder do
  before { allow(RequirementTemplate).to receive(:reindex) }

  it "puts seeded templates into real categories instead of leaving them uncategorized" do
    small = create(:requirement_template, nickname: "Small Complete Template")
    part_9 = create(:requirement_template, nickname: "Large Part 9 Template")
    part_3 = create(:requirement_template, nickname: "Large Part 3 Template")
    demolition =
      create(:requirement_template, nickname: "Demolition - Small Scale")
    demolition.tag_list.add("Demolition")
    demolition.save!

    described_class.seed!

    expect(small.reload.template_category.label).to eq("New construction")
    expect(part_9.reload.template_category.label).to eq("New construction")
    expect(part_3.reload.template_category.label).to eq("Structures")
    expect(demolition.reload.template_category.label).to eq("Site")
  end
end
