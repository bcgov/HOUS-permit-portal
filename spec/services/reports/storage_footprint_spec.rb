require "rails_helper"

RSpec.describe Reports::StorageFootprint do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  def document_with_size(application, size)
    document = create(:supporting_document, permit_application: application)
    data = document.file_data.deep_dup
    data["metadata"] ||= {}
    data["metadata"]["size"] = size
    document.update_column(:file_data, data)
  end

  it "sums shrine sizes and excludes submission zipfiles" do
    application = create(:permit_application)
    document_with_size(application, 2048)
    application.update_column(
      :zipfile_data,
      {
        "id" => SecureRandom.uuid,
        "storage" => "store",
        "metadata" => {
          "size" => 99_999
        }
      }
    )

    expect(figure("total_bytes")[:value]).to eq(2048)
    expect(figure("excluded_zipfile_bytes")[:value]).to eq(99_999)
    expect(figure("average_bytes_per_application")[:value]).to eq(2048)
  end

  it "excludes documents on discarded applications" do
    kept = create(:permit_application)
    discarded = create(:permit_application)
    document_with_size(kept, 1000)
    document_with_size(discarded, 5000)
    discarded.discard!

    expect(figure("total_bytes")[:value]).to eq(1000)
  end

  it "breaks down current storage by document type and jurisdiction" do
    jurisdiction = create(:sub_district)
    application = create(:permit_application, jurisdiction: jurisdiction)
    document_with_size(application, 4096)

    by_type = payload[:tables].find { |tbl| tbl[:key] == "by_type" }[:rows]
    supporting =
      by_type.find { |row| row["document_type"].include?("Supporting") }
    expect(supporting["bytes"]).to eq(4096)

    by_jurisdiction =
      payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }[:rows]
    row =
      by_jurisdiction.find do |entry|
        entry["jurisdiction"].include?(jurisdiction.name)
      end
    expect(row["bytes"]).to eq(4096)
  end

  it "projects the next year from the last three calendar months" do
    application = create(:permit_application)
    document_with_size(application, 3000)

    expected = (3000.0 / 3 * 12).round
    expect(figure("projected_next_12_months")[:value]).to eq(expected)
    expect(figure("projected_next_12_months")[:help_text]).to include(
      "three calendar months"
    )
  end

  it "states zipfile, discarded, billing, and projection treatment" do
    texts = payload[:notes].map { |note| note[:text] }.join(" ")

    expect(texts).to include("zipfiles")
    expect(texts).to include("discarded")
    expect(texts).to include("bills")
    expect(texts).to include("multiplied by 12")
  end
end
