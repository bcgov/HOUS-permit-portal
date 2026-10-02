require "rails_helper"

RSpec.describe PermitApplicationExportService do
  describe "#application_metrics_csv" do
    it "generates a CSV with translated headers and metrics rows" do
      allow(I18n).to receive(:t).with(
        "export.application_metrics_csv_headers"
      ).and_return(
        "jurisdiction,template,tags,draft,submitted,avg_first,avg_latest"
      )
      allow(PermitApplication).to receive(
        :stats_by_template_jurisdiction_and_status
      ).and_return(
        [
          {
            jurisdiction_name: "J1",
            template_nickname: "My Template",
            tags: %w[part9 residential],
            draft_applications: 2,
            submitted_applications: 1,
            average_time_spent_before_first_submit: 86400.0, # 1 day
            average_time_spent_before_latest_submit: 172800.0 # 2 days
          }
        ]
      )

      csv = described_class.new.application_metrics_csv

      expect(csv).to include("jurisdiction,template,tags")
      expect(csv).to include(
        "J1,My Template,\"part9, residential\",2,1,1.0,2.0"
      )
    end

    it "counts only live applications" do
      live_jurisdiction = create(:sub_district)
      create(:permit_application, jurisdiction: live_jurisdiction)
      sandbox_jurisdiction = create(:sub_district)
      create(
        :permit_application,
        jurisdiction: sandbox_jurisdiction,
        sandbox: published_sandbox(sandbox_jurisdiction)
      )

      stats = PermitApplication.stats_by_template_jurisdiction_and_status

      expect(stats.map { |row| row[:jurisdiction_name] }).to eq(
        [live_jurisdiction.qualified_name]
      )
    end
  end
end
