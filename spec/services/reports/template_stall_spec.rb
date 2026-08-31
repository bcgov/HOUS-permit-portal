require "rails_helper"

RSpec.describe Reports::TemplateStall do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  def table_rows(key)
    payload[:tables].find { |tbl| tbl[:key] == key }[:rows]
  end

  def version_for(nickname)
    template = create(:requirement_template, nickname: nickname)
    create(
      :template_version,
      requirement_template: template,
      status: :published
    )
  end

  def set_status(application, status, **columns)
    application.update_columns(
      { status: PermitApplication.statuses[status] }.merge(columns)
    )
  end

  it "reports withdrawal rate by template and version" do
    noisy = version_for("Noisy template")
    quiet = version_for("Quiet template")
    withdrawn = create(:permit_application, template_version: noisy)
    set_status(withdrawn, :withdrawn)
    create(:permit_application, template_version: noisy)
    create(:permit_application, template_version: quiet)

    templates = table_rows("templates")
    noisy_row = templates.find { |row| row["template"] == "Noisy template" }
    quiet_row = templates.find { |row| row["template"] == "Quiet template" }

    expect(figure("applications")[:value]).to eq(3)
    expect(figure("withdrawal_rate")[:value]).to eq("33.3%")
    expect(noisy_row["applications"]).to eq(2)
    expect(noisy_row["withdrawal_rate"]).to eq("50.0%")
    expect(noisy_row["status_mix"]).to include("Withdrawn: 1")
    expect(quiet_row["withdrawal_rate"]).to eq("0.0%")

    versions = table_rows("versions")
    expect(
      versions.find { |row| row["template"] == "Noisy template" }[
        "withdrawal_rate"
      ]
    ).to eq("50.0%")
    expect(versions.first).to have_key("version_date")
  end

  it "counts abandoned drafts with the 90-day draft-completion rule" do
    version = version_for("Stale draft template")
    abandoned = create(:permit_application, template_version: version)
    abandoned.update_column(:updated_at, 100.days.ago)
    create(:permit_application, template_version: version)

    row =
      table_rows("templates").find do |entry|
        entry["template"] == "Stale draft template"
      end

    expect(row["abandoned_rate"]).to eq("50.0%")
    expect(row["applications"]).to eq(2)
  end

  it "splits currently stuck our-court from stuck revisions and ignores range" do
    our_court_version = version_for("Our-court stall")
    revisions_version = version_for("Revisions stall")
    our_court =
      create(
        :permit_application,
        template_version: our_court_version,
        created_at: 2.years.ago
      )
    set_status(
      our_court,
      :newly_submitted,
      queue_time_seconds: 0,
      queue_clock_started_at: 40.days.ago
    )
    revisions =
      create(
        :permit_application,
        template_version: revisions_version,
        created_at: 2.years.ago
      )
    set_status(
      revisions,
      :revisions_requested,
      revisions_requested_at: 40.days.ago
    )

    short = described_class.new(range: Reports::Range.parse("3_months")).call
    short_figure =
      short[:headline_figures].find { |row| row[:key] == "stuck_our_court" }
    short_revisions =
      short[:headline_figures].find { |row| row[:key] == "stuck_revisions" }
    short_templates =
      short[:tables].find { |tbl| tbl[:key] == "templates" }[:rows]

    expect(short_figure[:value]).to eq(1)
    expect(short_revisions[:value]).to eq(1)
    expect(
      short[:headline_figures].find { |row| row[:key] == "applications" }[
        :value
      ]
    ).to eq(0)

    our_court_row =
      short_templates.find { |row| row["template"] == "Our-court stall" }
    revisions_row =
      short_templates.find { |row| row["template"] == "Revisions stall" }
    expect(our_court_row["stuck_our_court"]).to eq(1)
    expect(our_court_row["stuck_revisions"]).to eq(0)
    expect(revisions_row["stuck_our_court"]).to eq(0)
    expect(revisions_row["stuck_revisions"]).to eq(1)
  end

  it "excludes discarded and sandbox applications" do
    version = version_for("Live only")
    create(:permit_application, template_version: version)

    discarded = create(:permit_application, template_version: version)
    discarded.discard!

    jurisdiction = create(:sub_district)
    sandbox = jurisdiction.sandboxes.published.first
    create(
      :permit_application,
      template_version: version,
      jurisdiction: jurisdiction,
      sandbox: sandbox
    )

    expect(figure("applications")[:value]).to eq(1)
    expect(table_rows("templates").first["applications"]).to eq(1)
  end

  it "marks both tables sortable by stuck our-court descending" do
    templates = payload[:tables].find { |tbl| tbl[:key] == "templates" }
    versions = payload[:tables].find { |tbl| tbl[:key] == "versions" }

    expect(templates[:sortable]).to eq(true)
    expect(templates[:default_sort]).to eq(
      key: "stuck_our_court",
      direction: "desc"
    )
    expect(versions[:sortable]).to eq(true)
    expect(versions[:default_sort]).to eq(
      key: "stuck_our_court",
      direction: "desc"
    )
  end

  it "defines the queue clock and states that failed submissions are not captured" do
    texts = payload[:notes].map { |note| note[:text] }.join(" ")
    kinds = payload[:notes].map { |note| [note[:key], note[:kind]] }

    expect(texts).to include("newly submitted, resubmitted, or in review")
    expect(texts).to include("applicant")
    expect(texts).to include("no cancelled status")
    expect(kinds).to include(%w[failed_submissions not_measured])
  end
end
