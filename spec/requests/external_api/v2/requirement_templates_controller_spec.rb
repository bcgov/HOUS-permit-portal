require "rails_helper"

RSpec.describe "External API v2 requirement templates", type: :request do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }

  def auth_headers(key = external_api_key)
    {
      "Authorization" => "Bearer #{key.token}",
      "Content-Type" => "application/json"
    }
  end

  def publish(template)
    create(
      :template_version,
      status: :published,
      requirement_template: template
    )
  end

  it "lists kept templates with a published version, category first" do
    early = create(:template_category, label: "New construction", sort_order: 0)
    late = create(:template_category, label: "Additions", sort_order: 1)
    first =
      create(
        :requirement_template,
        nickname: "Low residential",
        description: "House",
        template_category: early,
        sort_order: 0
      )
    second =
      create(
        :requirement_template,
        nickname: "Laneway",
        description: "Lane",
        template_category: late,
        sort_order: 0
      )
    uncategorized =
      create(
        :requirement_template,
        nickname: "Uncategorized",
        description: nil,
        sort_order: 0
      )
    first_version = publish(first)
    publish(second)
    publish(uncategorized)

    get "/external_api/v2/requirement_templates", headers: auth_headers

    expect(response).to have_http_status(:ok)
    rows = JSON.parse(response.body).fetch("data")
    expect(rows.map { |row| row["id"] }).to eq(
      [first.id, second.id, uncategorized.id]
    )

    row = rows.first
    expect(row).to include(
      "nickname" => "Low residential",
      "description" => "House",
      "sort_order" => 0
    )
    expect(row.keys).to contain_exactly(
      "id",
      "nickname",
      "description",
      "sort_order",
      "template_category",
      "published_template_version"
    )
    expect(row["published_template_version"]).to include(
      "id" => first_version.id,
      "status" => "published",
      "requirement_template_id" => first.id,
      "feedbacks_count" => 0,
      "has_unresolved_feedbacks" => false
    )
    expect(row["template_category"]).to include(
      "id" => early.id,
      "label" => "New construction",
      "sort_order" => 0
    )
    expect(rows.last["template_category"]).to be_nil
  end

  it "omits a template that has no published version" do
    draft_only = create(:requirement_template, nickname: "Draft only")
    create(:template_version, status: :draft, requirement_template: draft_only)

    get "/external_api/v2/requirement_templates", headers: auth_headers

    ids = JSON.parse(response.body).fetch("data").map { |row| row["id"] }
    expect(ids).not_to include(draft_only.id)
  end

  it "omits a discarded template" do
    template = create(:requirement_template, nickname: "Discarded")
    publish(template)
    template.update_column(:discarded_at, Time.current)

    get "/external_api/v2/requirement_templates", headers: auth_headers

    ids = JSON.parse(response.body).fetch("data").map { |row| row["id"] }
    expect(ids).not_to include(template.id)
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    get "/external_api/v2/requirement_templates", headers: auth_headers(v1_key)

    expect(response).to have_http_status(:forbidden)
  end
end
