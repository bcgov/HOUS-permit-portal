require "rails_helper"

RSpec.describe PreCheckExportService do
  let(:service) { described_class.new }

  describe "#user_consent_csv" do
    it "outputs rows for pre-checks with creators and skips those without" do
      creator = instance_double("User", email: "a@example.com", name: "A User")
      jurisdiction = instance_double("Jurisdiction", qualified_name: "Jur A")

      pre_check_with_creator =
        instance_double(
          "PreCheck",
          creator: creator,
          jurisdiction: jurisdiction,
          created_at: Time.zone.parse("2026-02-01 10:00:00"),
          submitted_at: nil,
          completed_at: nil,
          eula_accepted: true,
          consent_to_send_drawings: true,
          consent_to_share_with_jurisdiction: false,
          consent_to_research_contact: false
        )
      pre_check_without_creator = instance_double("PreCheck", creator: nil)

      relation = double("ARRelation")
      allow(PreCheck).to receive(:includes).and_return(relation)
      allow(relation).to receive(:order).and_return(relation)
      allow(relation).to receive(:limit).and_return(relation)
      allow(relation).to receive(:find_each).and_yield(
        pre_check_with_creator
      ).and_yield(pre_check_without_creator)

      csv = service.user_consent_csv

      expect(csv).to include("Email,Name,Created Date,Jurisdiction")
      expect(csv).to include("a@example.com,A User,2026-02-01 10:00:00,Jur A")
      # only one row beyond header
      expect(csv.lines.count).to eq(2)
    end
  end
end
