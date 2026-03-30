require "rails_helper"

RSpec.describe PermitClassificationSeeder do
  describe ".seed" do
    it "updates existing classifications and creates missing ones, then reindexes" do
      existing = instance_double("PermitClassification", update: true)

      allow(PermitClassification).to receive(:find_by) do |args|
        args[:code] == "low_residential" ? existing : nil
      end
      allow(PermitClassification).to receive(:create!)
      allow(PermitApplication).to receive(:reindex)
      allow(RequirementTemplate).to receive(:reindex)

      described_class.seed

      expect(existing).to have_received(:update).with(
        hash_including(code: "low_residential")
      )
      expect(PermitClassification).to have_received(:create!).at_least(:once)
      expect(PermitApplication).to have_received(:reindex)
      expect(RequirementTemplate).to have_received(:reindex)
    end
  end
end
