require "rails_helper"

RSpec.describe Reports::PlatformHealth do
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

  it "counts collaboration from project collaborations" do
    application = create(:permit_application)
    create(
      :permit_project_collaboration,
      permit_project: application.permit_project
    )
    create(:permit_application)

    expect(figure("collaborated_applications")[:value]).to eq(1)
    expect(figure("collaboration_rate")[:value]).to eq("50.0%")
    expect(figure("project_collaborations")[:value]).to eq(1)
  end

  it "profiles document counts and sizes in megabytes" do
    application = create(:permit_application)
    document_with_size(application, 2.megabytes)
    document_with_size(application, 1.megabyte)
    create(:permit_application)

    expect(figure("average_documents")[:value]).to eq(1.0)
    expect(figure("average_total_size_bytes")[:value]).to eq(1.5)
    expect(figure("average_total_size_bytes")[:label]).to include("MB")
    expect(figure("maximum_total_size_bytes")[:value]).to eq(3.0)
    help = [
      figure("average_total_size_bytes")[:help_text],
      figure("maximum_total_size_bytes")[:help_text],
      payload[:notes].map { |note| note[:text] }.join
    ].join
    expect(help).not_to include("Shrine")
    expect(help).not_to include("file_data")
  end

  it "states that failed submissions and errors are not measured" do
    kinds = payload[:notes].map { |note| [note[:key], note[:kind]] }
    expect(kinds).to include(%w[failed_submissions not_measured])
    expect(kinds).to include(%w[errors not_measured])
    expect(payload[:notes].map { |note| note[:text] }.join).not_to match(
      /\b0 errors\b/i
    )
  end
end
