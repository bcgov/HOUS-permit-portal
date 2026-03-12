require "rails_helper"

RSpec.describe PermitApplicationExportService do
  describe "#application_metrics_csv" do
    it "generates a CSV with translated headers and metrics rows" do
      allow(I18n).to receive(:t).with(
        "export.application_metrics_csv_headers"
      ).and_return(
        "jurisdiction,permit_type,activity,first_nations,draft,submitted,avg_first,avg_latest"
      )
      allow(PermitApplication).to receive(
        :stats_by_template_jurisdiction_and_status
      ).and_return(
        [
          {
            jurisdiction_name: "J1",
            permit_type: "PT",
            activity: "A",
            first_nations: false,
            draft_applications: 2,
            submitted_applications: 1,
            average_time_spent_before_first_submit: 86400.0, # 1 day
            average_time_spent_before_latest_submit: 172800.0 # 2 days
          }
        ]
      )

      csv = described_class.new.application_metrics_csv

      expect(csv).to include("jurisdiction,permit_type,activity")
      expect(csv).to include("J1,PT,A,false,2,1,1.0,2.0")
    end
  end
end
