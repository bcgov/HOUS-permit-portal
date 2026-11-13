require "rails_helper"

RSpec.describe JurisdictionExplainer, type: :model do
  describe "associations" do
    it { should belong_to(:jurisdiction) }
    it { should belong_to(:requirement_template) }
  end

  it "stores one local context per jurisdiction and template" do
    explainer = create(:jurisdiction_explainer)
    duplicate =
      build(
        :jurisdiction_explainer,
        jurisdiction: explainer.jurisdiction,
        requirement_template: explainer.requirement_template
      )

    expect(duplicate).not_to be_valid
  end

  it "collapses blank editor html" do
    explainer = create(:jurisdiction_explainer, local_context_html: "<p></p>")

    expect(explainer.local_context_html).to eq("")
    expect(explainer).not_to be_filled
  end

  it "rejects local context over 4000 plain characters" do
    explainer =
      build(:jurisdiction_explainer, local_context_html: "<p>#{"a" * 4001}</p>")

    expect(explainer).not_to be_valid
  end

  it "allows 4000 plain characters" do
    explainer =
      build(:jurisdiction_explainer, local_context_html: "<p>#{"a" * 4000}</p>")

    expect(explainer).to be_valid
  end
end
