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

  describe "Scope" do
    def resolve
      external_api_scope_for(
        described_class,
        external_api_key:,
        scope: PermitProject.all
      )
    end

    def queue(project)
      project.update_column(:state, PermitProject.states[:queued])
      project
    end

    it "includes a non-draft project with a submitted application in the key's jurisdiction and sandbox" do
      project =
        queue(create_application(status: :newly_submitted).permit_project)

      expect(resolve).to contain_exactly(project)
    end

    it "excludes drafts, draft-only non-draft rows, other jurisdictions, the wrong sandbox, and discarded projects" do
      draft_only = create_application(status: :new_draft).permit_project
      queued_without_submission =
        queue(create_application(status: :new_draft).permit_project)
      other_project =
        queue(
          create_application(
            status: :newly_submitted,
            jurisdiction: other_jurisdiction
          ).permit_project
        )
      wrong_sandbox =
        queue(
          create_application(
            status: :newly_submitted,
            sandbox: published_sandbox
          ).permit_project
        )
      discarded =
        queue(create_application(status: :newly_submitted).permit_project)
      discarded.discard!

      expect(resolve).not_to include(
        draft_only,
        queued_without_submission,
        other_project,
        wrong_sandbox,
        discarded
      )
    end

    it "includes a sandbox project only for a key in that sandbox" do
      live = queue(create_application(status: :newly_submitted).permit_project)
      sandbox_project =
        queue(
          create_application(
            status: :newly_submitted,
            sandbox: published_sandbox
          ).permit_project
        )
      sandbox_key =
        create(
          :external_api_key,
          jurisdiction:,
          sandbox: published_sandbox,
          api_version: "v2"
        )

      scoped =
        external_api_scope_for(
          described_class,
          external_api_key: sandbox_key,
          scope: PermitProject.all
        )

      expect(scoped).to contain_exactly(sandbox_project)
      expect(scoped).not_to include(live)
    end
  end

  describe "#update_state?" do
    it "matches project read visibility" do
      visible = create_application(status: :newly_submitted).permit_project
      draft_only = create_application(status: :new_draft).permit_project

      expect(policy(visible).update_state?).to be true
      expect(policy(draft_only).update_state?).to be false
    end
  end

  describe "#create_permit_applications?" do
    it "matches project read visibility" do
      visible = create_application(status: :newly_submitted).permit_project
      draft_only = create_application(status: :new_draft).permit_project

      expect(policy(visible).create_permit_applications?).to be true
      expect(policy(draft_only).create_permit_applications?).to be false
    end
  end
end
