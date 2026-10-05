require "rails_helper"

RSpec.describe PrintReports::Snapshot do
  let(:application) { create(:permit_application) }
  let(:schema) do
    {
      "components" => [
        {
          "id" => "block",
          "components" => [
            {
              "id" => "elective",
              "key" => "original_key",
              "type" => "textfield",
              "input" => true,
              "label" => "Original label",
              "elective" => true,
              "customConditional" => "show = true;show = false"
            }
          ]
        }
      ]
    }
  end

  it "freezes identity, answers and elective settings independently of later edits" do
    settings =
      create(
        :jurisdiction_template_version_customization,
        jurisdiction: application.jurisdiction,
        template_version: application.template_version,
        customizations_data: {
          "block" => {
            "enabled_elective_field_ids" => ["elective"]
          }
        }
      )
    application.permit_project.update!(full_address: "42 Original Street")
    version =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application,
        form_json: schema,
        submission_data: {
          "data" => {
            "original_key" => "Original answer",
            "zero" => 0,
            "false" => false
          }
        }
      )
    original =
      PrintReports::Data
        .for_generation
        .application(application, version.id)
        .except(:identity)
    settings.update!(customizations: {})
    application.permit_project.update!(full_address: "99 Changed Street")
    application.submitter.update!(first_name: "Changed")
    version.update!(
      form_json: {
        "components" => []
      },
      submission_data: {
        "data" => {
        }
      }
    )
    report =
      PrintReports::Data.for_generation.application(application, version.id)
    expect(report.except(:identity)).to eq(original)
    expect(report[:identity][:address]).to eq("42 Original Street")
    expect(
      report.dig(
        :form_json,
        "components",
        0,
        "components",
        0,
        "customConditional"
      )
    ).to eq("show = true")
    expect(
      schema.dig("components", 0, "components", 0, "customConditional")
    ).to end_with(";show = false")
  end

  it "uses the sandbox's explicit settings even when the application accessor differs" do
    sandbox =
      application.jurisdiction.sandboxes.find_by!(
        template_version_status_scope: :published
      )
    application.permit_project.update!(sandbox: sandbox)
    create(
      :jurisdiction_template_version_customization,
      jurisdiction: application.jurisdiction,
      template_version: application.template_version,
      sandbox: sandbox,
      customizations_data: {
        "block" => {
          "enabled_elective_field_ids" => ["elective"]
        }
      }
    )
    allow(application).to receive(:form_customizations).and_return({})
    version =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application,
        form_json: schema
      )
    expect(
      version.report_snapshot.dig(
        "reports",
        "application",
        "form_json",
        "components",
        0,
        "components",
        0,
        "customConditional"
      )
    ).to eq("show = true")
  end

  it "rejects application writes to a captured snapshot" do
    version =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application
      )
    expect { version.update!(report_snapshot: {}) }.to raise_error(
      ActiveRecord::ActiveRecordError
    )
    expect { version.update_columns(report_snapshot: {}) }.to raise_error(
      ActiveRecord::ActiveRecordError
    )
    expect(version.reload.report_snapshot["format_version"]).to eq(1)
  end

  it "rejects unsupported and malformed formats rather than using live data" do
    version =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application
      )
    [
      nil,
      {},
      { "format_version" => 999 },
      { "format_version" => 1, "reports" => [] }
    ].each do |snapshot|
      expect { described_class.validate!(snapshot, version) }.to raise_error(
        PrintReports::Data::Unavailable
      )
    end
  end

  it "captures each real submission independently and rolls back when capture fails" do
    application.template_version.update!(form_json: { "components" => [] })
    allow(application).to receive(:can_submit?).and_return(true)
    allow(application).to receive(:send_submit_notifications)
    application.submit!
    first = application.submission_versions.order(:created_at).last
    expect(
      first.report_snapshot.dig(
        "reports",
        "application",
        "identity",
        "version_number"
      )
    ).to eq(1)
    create(:revision_request, submission_version: first)
    application.update!(status: :revisions_requested)
    application.permit_project.update!(full_address: "Second address")
    application.submit!
    second = application.submission_versions.order(:created_at).last
    expect(
      second.report_snapshot.dig(
        "reports",
        "application",
        "identity",
        "version_number"
      )
    ).to eq(2)
    expect(
      second.report_snapshot.dig(
        "reports",
        "application",
        "identity",
        "address"
      )
    ).to eq("Second address")
    expect(
      first.reload.report_snapshot.dig(
        "reports",
        "application",
        "identity",
        "address"
      )
    ).not_to eq("Second address")
    create(:revision_request, submission_version: second)
    application.update!(status: :revisions_requested)
    allow(described_class).to receive(:capture).and_raise(
      PrintReports::Data::Unavailable,
      "capture failed"
    )
    expect { application.submit! }.to raise_error(
      PrintReports::Data::Unavailable
    )
    expect(application.reload.status).to eq("revisions_requested")
    expect(application.submission_versions.count).to eq(2)
  end
end
