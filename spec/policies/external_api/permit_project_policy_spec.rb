require "rails_helper"

RSpec.describe ExternalApi::PermitProjectPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:other_jurisdiction) { create(:sub_district) }
  let(:published_sandbox) { jurisdiction.sandboxes.published.first }
  let(:sandbox) { nil }
  let(:external_api_key) do
    create(:external_api_key, jurisdiction:, sandbox:, api_version: "v2")
  end

  def policy(record)
    external_api_policy_for(
      described_class,
      external_api_key: external_api_key,
      record:
    )
  end

  def create_application(status:, jurisdiction: self.jurisdiction, sandbox: nil)
    create(:permit_application, jurisdiction:, sandbox:, status:)
  end

  describe "#show?" do
    it "permits a live project with a submitted application in the key's jurisdiction" do
      record = create_application(status: :newly_submitted).permit_project

      expect(policy(record).show?).to be true
    end

    it "permits when the only visible sibling is revisions_requested" do
      record = create_application(status: :revisions_requested).permit_project

      expect(policy(record).show?).to be true
    end

    it "denies a project that only has drafts" do
      record = create_application(status: :new_draft).permit_project

      expect(policy(record).show?).to be false
    end

    it "denies when jurisdiction differs" do
      record =
        create_application(
          status: :newly_submitted,
          jurisdiction: other_jurisdiction
        ).permit_project

      expect(policy(record).show?).to be false
    end

    it "denies a sandbox project when the key is live" do
      record =
        create_application(
          status: :newly_submitted,
          sandbox: published_sandbox
        ).permit_project

      expect(policy(record).show?).to be false
    end

    it "denies a live project when the key is sandboxed" do
      live_record = create_application(status: :newly_submitted).permit_project
      sandbox_key =
        create(
          :external_api_key,
          jurisdiction:,
          sandbox: published_sandbox,
          api_version: "v2"
        )

      expect(
        external_api_policy_for(
          described_class,
          external_api_key: sandbox_key,
          record: live_record
        ).show?
      ).to be false
    end
  end
end
