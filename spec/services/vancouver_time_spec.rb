require "rails_helper"

RSpec.describe "Vancouver time rules" do
  include ActiveSupport::Testing::TimeHelpers

  {
    "2026-01-15T20:00:00Z" => "2026-01-15T12:00:00-08:00",
    "2026-07-15T20:00:00Z" => "2026-07-15T13:00:00-07:00",
    "2026-11-01T08:59:00Z" => "2026-11-01T01:59:00-07:00",
    "2026-11-01T09:00:00Z" => "2026-11-01T02:00:00-07:00",
    "2027-01-15T20:00:00Z" => "2027-01-15T13:00:00-07:00"
  }.each do |instant, expected|
    it "converts #{instant} in the configured application zone" do
      expect(Time.iso8601(instant).in_time_zone.iso8601).to eq(expected)
    end
  end

  it "makes today's scheduled template eligible at 00:01 Vancouver time" do
    travel_to(Time.iso8601("2026-11-03T07:01:00Z")) do
      today =
        create(
          :template_version,
          status: :scheduled,
          version_date: "2026-11-03"
        )
      tomorrow =
        create(
          :template_version,
          status: :scheduled,
          version_date: "2026-11-04"
        )

      expect(TemplateVersioningService.get_versions_publishable_now).to include(
        today
      )
      expect(
        TemplateVersioningService.get_versions_publishable_now
      ).not_to include(tomorrow)
    end
  end

  it "represents a winter template date as Vancouver midnight" do
    version = TemplateVersion.new(version_date: "2027-01-15")
    expect(version.version_date_in_province_time.utc.iso8601).to eq(
      "2027-01-15T07:00:00Z"
    )
  end

  it "buckets winter timestamps on either side of Vancouver midnight in the correct month" do
    report =
      Reports::ApplicationGrowth.new(range: Reports::Range.parse("all_time"))
    sql = report.send(:local_month_sql, "timestamp '2027-02-01 07:30:00'")
    expect(
      ActiveRecord::Base.connection.select_value("SELECT #{sql}").to_s
    ).to eq("2027-02-01")
    sql = report.send(:local_month_sql, "timestamp '2027-02-01 06:30:00'")
    expect(
      ActiveRecord::Base.connection.select_value("SELECT #{sql}").to_s
    ).to eq("2027-01-01")
  end
end
