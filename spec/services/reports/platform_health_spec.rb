require "rails_helper"

RSpec.describe Reports::PlatformHealth do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
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

  it "profiles document counts and shrine metadata sizes" do
    application = create(:permit_application)
    create(
      :supporting_document,
      permit_application: application,
      file_data: {
        "metadata" => {
          "size" => 2048
        }
      }
    )
    create(
      :supporting_document,
      permit_application: application,
      file_data: {
        "metadata" => {
          "size" => 1024
        }
      }
    )
    create(:permit_application)

    expect(figure("average_documents")[:value]).to eq(1.0)
    expect(figure("average_total_size_bytes")[:value]).to eq(1536)
    expect(figure("maximum_total_size_bytes")[:value]).to eq(3072)
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
