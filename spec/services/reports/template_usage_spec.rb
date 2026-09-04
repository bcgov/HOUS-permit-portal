require "rails_helper"

RSpec.describe Reports::TemplateUsage do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "counts applications per template combined and by jurisdiction" do
    category = create(:template_category, label: "New housing")
    template =
      create(
        :requirement_template,
        nickname: "Part 9 house",
        template_category: category
      )
    version =
      create(
        :template_version,
        requirement_template: template,
        status: :published
      )
    jurisdiction = create(:sub_district)
    create(
      :permit_application,
      jurisdiction: jurisdiction,
      template_version: version
    )

    combined = payload[:tables].find { |tbl| tbl[:key] == "combined" }[:rows]
    by_jurisdiction =
      payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }[:rows]

    expect(figure("applications")[:value]).to eq(1)
    expect(combined.first["template"]).to eq("Part 9 house")
    expect(combined.first["category"]).to eq("New housing")
    expect(combined.first["count"]).to eq(1)
    expect(by_jurisdiction.first["jurisdiction"]).to include(jurisdiction.name)
  end

  it "lists published template versions with no live applications" do
    unused = create(:requirement_template, nickname: "Unused template")
    create(:template_version, requirement_template: unused, status: :published)

    never_used =
      payload[:tables].find { |tbl| tbl[:key] == "published_never_used" }[:rows]
    unused_row = never_used.find { |row| row["template"] == "Unused template" }

    expect(unused_row).to be_present
    expect(figure("published_never_used")[:value]).to be >= 1
  end
end
