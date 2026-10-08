require "rails_helper"

RSpec.describe Reports::StorageFootprint do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  def excluded(category)
    payload[:tables].find { |tbl| tbl[:key] == "excluded" }[:rows].find do |row|
      row["category"] == category
    end
  end

  def resize(document, size)
    data = document.file_data.deep_dup
    data["metadata"] ||= {}
    data["metadata"]["size"] = size
    document.update_column(:file_data, data)
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
    document_with_size(application, 2.megabytes)
    create(:submission_version, permit_application: application).update_column(
      :zipfile_data,
      {
        "id" => SecureRandom.uuid,
        "storage" => "store",
        "metadata" => {
          "size" => 1.megabyte
        }
      }
    )

    expect(figure("total_bytes")[:value]).to eq(2.0)
    expect(figure("total_bytes")[:label]).to include("MB")
    expect(excluded("Submission zipfiles")["bytes"]).to eq(1.0)
    expect(figure("accounted_bytes")[:value]).to eq(3.0)
    expect(figure("average_bytes_per_application")[:value]).to eq(2.0)
  end

  it "excludes documents on discarded applications" do
    kept = create(:permit_application)
    discarded = create(:permit_application)
    document_with_size(kept, 1.megabyte)
    document_with_size(discarded, 2.megabytes)
    discarded.discard!

    expect(figure("total_bytes")[:value]).to eq(1.0)
    expect(excluded("Discarded")["bytes"]).to eq(2.0)
  end

  it "reports sandboxed documents separately from the live total" do
    live = create(:report_document, step_code: create(:part_9_step_code))
    resize(live, 1.megabyte)
    sandboxed =
      create(
        :report_document,
        step_code: create(:part_9_step_code, sandbox: published_sandbox)
      )
    resize(sandboxed, 2.megabytes)
    jurisdiction = create(:sub_district)
    sandboxed_application =
      create(
        :permit_application,
        jurisdiction: jurisdiction,
        sandbox: published_sandbox(jurisdiction)
      )
    document_with_size(sandboxed_application, 1.megabyte)

    expect(figure("total_bytes")[:value]).to eq(1.0)
    expect(excluded("Sandbox (training)")["bytes"]).to eq(3.0)
    expect(figure("accounted_bytes")[:value]).to eq(4.0)
  end

  it "breaks down current storage by document type and jurisdiction" do
    jurisdiction = create(:sub_district)
    application = create(:permit_application, jurisdiction: jurisdiction)
    document_with_size(application, 2.megabytes)

    by_type = payload[:tables].find { |tbl| tbl[:key] == "by_type" }[:rows]
    supporting =
      by_type.find { |row| row["document_type"].include?("Supporting") }
    expect(supporting["bytes"]).to eq(2.0)

    by_jurisdiction =
      payload[:tables].find { |tbl| tbl[:key] == "by_jurisdiction" }[:rows]
    row =
      by_jurisdiction.find do |entry|
        entry["jurisdiction"].include?(jurisdiction.name)
      end
    expect(row["bytes"]).to eq(2.0)
  end

  it "projects the next year from the last three calendar months" do
    application = create(:permit_application)
    document_with_size(application, 3.megabytes)

    expect(figure("projected_next_12_months")[:value]).to eq(12.0)
    expect(figure("projected_next_12_months")[:help_text]).to include(
      "three calendar months"
    )
  end

  it "states zipfile, discarded, billing, and projection treatment" do
    texts = payload[:notes].map { |note| note[:text] }.join(" ")

    expect(texts).to include("zipfile")
    expect(texts).to include("discarded")
    expect(texts).to include("bills")
    expect(texts).to include("multiplied by 12")
  end
end
