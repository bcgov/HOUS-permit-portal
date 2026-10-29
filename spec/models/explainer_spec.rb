require "rails_helper"

RSpec.describe Explainer, type: :model do
  let(:template) { create(:requirement_template) }

  describe "associations" do
    it { should belong_to(:requirement_template) }
    it { should have_many(:documents).dependent(:destroy) }
    it { should have_many(:related_template_links).dependent(:destroy) }
    it { should have_many(:related_templates).through(:related_template_links) }
  end

  def explainer_with(attrs)
    create(:explainer, requirement_template: template).tap do |explainer|
      explainer.update!(attrs)
    end
  end

  it "saves without publishing" do
    explainer =
      explainer_with(introduction_html: "<p>When you need this permit</p>")

    expect(explainer).not_to be_published
    expect(explainer.introduction_html).to include("When you need this permit")
  end

  it "publishes the same fields and keeps later edits on those fields" do
    explainer =
      explainer_with(
        introduction_html: "<p>When you need this permit</p>",
        publish: true
      )

    expect(explainer).to be_published

    explainer.update!(
      before_you_apply_html: "<p>Bring drawings</p>",
      publish: true
    )

    expect(explainer).to be_published
    expect(explainer.before_you_apply_html).to include("Bring drawings")
    expect(explainer.introduction_html).to include("When you need this permit")
  end

  it "blocks publish when page title and introduction is empty and keeps the saved fields" do
    explainer =
      explainer_with(
        introduction_html: "<p>When you need this permit</p>",
        publish: true
      )

    expect(
      explainer.update(introduction_html: "<p></p>", publish: true)
    ).to be false
    expect(explainer.errors.full_messages.join).to include(
      "Page title and introduction"
    )

    explainer.reload
    expect(explainer).to be_published
    expect(explainer.introduction_html).to include("When you need this permit")
  end

  it "unpublishes without clearing the fields" do
    explainer =
      explainer_with(
        introduction_html: "<p>When you need this permit</p>",
        publish: true
      )

    explainer.update!(publish: false)

    expect(explainer).not_to be_published
    expect(explainer.introduction_html).to include("When you need this permit")
  end

  it "keeps only published templates other than this one, and drops empty steps and links" do
    other = create(:requirement_template, nickname: "Plumbing permit")
    create(:template_version, requirement_template: other, status: :published)
    unpublished = create(:requirement_template, nickname: "Hidden")

    explainer =
      explainer_with(
        introduction_html: "<script>alert(1)</script><p>Ok</p>",
        steps: [
          { title: " ", description: "" },
          { title: "Completeness check", description: "Staff confirm the file" }
        ],
        links: [
          { title: " ", url: "" },
          { title: "BC Building Code", url: "https://www.bccodes.ca" }
        ],
        related_template_ids: [other.id, unpublished.id, template.id]
      )

    expect(explainer.introduction_html).not_to include("script")
    expect(explainer.steps).to eq(
      [
        {
          "title" => "Completeness check",
          "description" => "Staff confirm the file"
        }
      ]
    )
    expect(explainer.links).to eq(
      [{ "title" => "BC Building Code", "url" => "https://www.bccodes.ca" }]
    )
    expect(explainer.related_template_ids).to eq([other.id])
  end

  it "rejects a link that is missing a title or a URL and keeps the saved links" do
    explainer =
      explainer_with(
        links: [{ title: "BC Building Code", url: "https://www.bccodes.ca" }]
      )

    expect(explainer.update(links: [{ title: "Code", url: " " }])).to be false
    expect(explainer.errors.full_messages.join).to include("title and a URL")

    explainer.reload
    expect(explainer.links).to eq(
      [{ "title" => "BC Building Code", "url" => "https://www.bccodes.ca" }]
    )

    expect(
      explainer.update(links: [{ title: "", url: "https://www.bccodes.ca" }])
    ).to be false
    expect(
      explainer.update(links: [{ title: "Bad", url: "javascript:alert(1)" }])
    ).to be false
    explainer.reload
    expect(explainer.links).to eq(
      [{ "title" => "BC Building Code", "url" => "https://www.bccodes.ca" }]
    )
  end

  it "rejects a step that is missing a title or a description and keeps the saved steps" do
    explainer =
      explainer_with(
        steps: [{ title: "Apply", description: "Submit the form" }]
      )

    expect(
      explainer.update(steps: [{ title: "Apply", description: " " }])
    ).to be false
    expect(explainer.errors.full_messages.join).to include(
      "title and a description"
    )

    explainer.reload
    expect(explainer.steps).to eq(
      [{ "title" => "Apply", "description" => "Submit the form" }]
    )

    expect(
      explainer.update(steps: [{ title: "", description: "Submit the form" }])
    ).to be false
    explainer.reload
    expect(explainer.steps).to eq(
      [{ "title" => "Apply", "description" => "Submit the form" }]
    )
  end

  it "drops related-permit pointers when the pointed-at template is deleted" do
    other = create(:requirement_template, nickname: "Plumbing permit")
    create(:template_version, requirement_template: other, status: :published)
    explainer = explainer_with(related_template_ids: [other.id])

    other.destroy!

    expect(explainer.reload.related_template_ids).to eq([])
  end

  it "creates nested documents and destroys removed ones immediately" do
    explainer = described_class.create!(requirement_template: template)
    kept =
      explainer.documents.create!(
        file: TestData.cached_file_data(filename: "kept.pdf")
      )
    removed =
      explainer.documents.create!(
        file: TestData.cached_file_data(filename: "removed.pdf")
      )

    explainer.update!(
      introduction_html: "<p>When you need this permit</p>",
      publish: true,
      documents_attributes: [
        { id: kept.id },
        { id: removed.id, _destroy: true },
        { file: TestData.cached_file_data(filename: "added.pdf") }
      ]
    )

    expect(explainer).to be_published
    expect(explainer.documents.reload.map(&:file_name)).to contain_exactly(
      "kept.pdf",
      "added.pdf"
    )
  end
end
