require "rails_helper"

RSpec.describe Reports::Accounts do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "counts kept accounts by role and excludes discarded accounts" do
    create(:user, :submitter)
    create(:user, :reviewer)
    create(:user, :submitter, :discarded)

    expect(figure("total_accounts")[:value]).to eq(2)
    expect(figure("new_accounts")[:value]).to eq(2)

    month_table = payload[:tables].find { |tbl| tbl[:key] == "new_by_month" }
    expect(month_table[:rows].sum { |row| row["submitter"].to_i }).to eq(1)
    expect(month_table[:rows].sum { |row| row["reviewer"].to_i }).to eq(1)
  end

  it "breaks current staff accounts down by jurisdiction" do
    jurisdiction = create(:sub_district)
    create(:user, :review_manager, jurisdiction: jurisdiction)

    rows = payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }[:rows]
    row = rows.find { |item| item["jurisdiction"] == jurisdiction.name }

    expect(row["role"]).to eq("Review manager")
    expect(row["count"]).to eq(1)
  end

  it "documents that active users cannot be measured" do
    note = payload[:notes].find { |item| item[:key] == "active_users" }

    expect(note[:kind]).to eq("not_measured")
    expect(note[:text]).to include("login")
  end
end
