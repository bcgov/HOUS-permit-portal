require "rails_helper"

RSpec.describe RevisionReasonSeeder do
  describe ".seed" do
    it "creates revision reasons on the site configuration" do
      revision_reason = instance_double("RevisionReason")
      allow(revision_reason).to receive(:description=)

      assoc = double("RevisionReasonsAssoc")
      allow(assoc).to receive(:find_or_create_by).and_yield(revision_reason)

      site_config =
        instance_double("SiteConfiguration", revision_reasons: assoc)
      allow(SiteConfiguration).to receive(:instance).and_return(site_config)

      described_class.seed

      expect(assoc).to have_received(:find_or_create_by).at_least(:once)
      expect(revision_reason).to have_received(:description=).at_least(:once)
    end
  end
end
