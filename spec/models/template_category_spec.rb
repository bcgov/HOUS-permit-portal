require "rails_helper"

RSpec.describe TemplateCategory, type: :model do
  it "orders categories by sort order" do
    later = create(:template_category)
    earlier = create(:template_category)
    later.insert_at(1)
    earlier.insert_at(0)

    expect(described_class.ordered).to eq([earlier, later])
  end

  it "requires case-insensitive unique labels" do
    create(:template_category, label: "Trades")

    duplicate = build(:template_category, label: "trades")

    expect(duplicate).not_to be_valid
  end

  it "leaves templates uncategorized when a category is deleted" do
    category = create(:template_category)
    template = create(:requirement_template, template_category: category)

    category.destroy!

    expect(template.reload.template_category).to be_nil
  end
end
