require "rails_helper"

RSpec.describe ExternalApi::PermitApplicationPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:other_jurisdiction) { create(:sub_district) }
  let(:published_sandbox) { jurisdiction.sandboxes.published.first }
  let(:scheduled_sandbox) { jurisdiction.sandboxes.scheduled.first }
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

  def resolved_scope
    external_api_scope_for(described_class, external_api_key:)
  end

  def create_application(status:, jurisdiction: self.jurisdiction, sandbox: nil)
    create(:permit_application, jurisdiction:, sandbox:, status:)
  end

  describe "#index?/#show?/#update_status?/#show_submission_version?" do
    it "permits when jurisdiction matches, record is submitted, and sandbox matches" do
      record = create_application(status: :newly_submitted)

      expect(policy(record).index?).to be true
      expect(policy(record).show?).to be true
      expect(policy(record).show_submission_version?).to be true
      expect(policy(record).update_status?).to be true
    end

    it "denies drafts and revisions_requested" do
      %i[new_draft revisions_requested].each do |status|
        record = create_application(status:)
        expect(policy(record).index?).to be(false), status.to_s
        expect(policy(record).update_status?).to be(false), status.to_s
      end
    end

    it "denies when jurisdiction differs" do
      record =
        create_application(
          status: :newly_submitted,
          jurisdiction: other_jurisdiction
        )

      expect(policy(record).index?).to be false
    end

    it "denies a sandbox application when the key is live" do
      record =
        create_application(status: :newly_submitted, sandbox: published_sandbox)

      expect(policy(record).index?).to be false
    end

    it "denies a live application when the key is sandboxed" do
      live_record = create_application(status: :newly_submitted)
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
        ).index?
      ).to be false
    end

    it "denies an application from a different sandbox of the same jurisdiction" do
      record =
        create_application(status: :newly_submitted, sandbox: scheduled_sandbox)
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
          record:
        ).index?
      ).to be false
    end
  end

  describe "#show_integration_mapping?" do
    it "permits when jurisdiction matches (submitted state not required)" do
      record = create_application(status: :new_draft)
      expect(policy(record).show_integration_mapping?).to be true
    end

    it "denies when jurisdiction differs" do
      record =
        create_application(
          status: :newly_submitted,
          jurisdiction: other_jurisdiction
        )
      expect(policy(record).show_integration_mapping?).to be false
    end
  end

  describe "Scope" do
    it "includes every submitted status in the key's live jurisdiction and sandbox" do
      included =
        PermitApplication.submitted_statuses.map do |status|
          create_application(status: status.to_sym)
        end

      expect(resolved_scope).to match_array(included)
    end

    it "excludes drafts, revisions_requested, other jurisdictions, and other sandboxes" do
      create_application(status: :new_draft)
      create_application(status: :revisions_requested)
      create_application(
        status: :newly_submitted,
        jurisdiction: other_jurisdiction
      )
      create_application(status: :newly_submitted, sandbox: published_sandbox)

      expect(resolved_scope).to be_empty
    end

    it "for a sandbox key, includes only submitted applications in that sandbox" do
      sandbox_key =
        create(
          :external_api_key,
          jurisdiction:,
          sandbox: published_sandbox,
          api_version: "v2"
        )
      included =
        create_application(status: :newly_submitted, sandbox: published_sandbox)
      create_application(status: :newly_submitted)
      create_application(status: :newly_submitted, sandbox: scheduled_sandbox)
      create_application(status: :new_draft, sandbox: published_sandbox)
      create_application(
        status: :newly_submitted,
        jurisdiction: other_jurisdiction,
        sandbox: other_jurisdiction.sandboxes.published.first
      )

      expect(
        external_api_scope_for(described_class, external_api_key: sandbox_key)
      ).to contain_exactly(included)
    end

    it "agrees with index? for every candidate record" do
      candidates = [
        create_application(status: :newly_submitted),
        create_application(status: :resubmitted),
        create_application(status: :in_review),
        create_application(status: :approved),
        create_application(status: :issued),
        create_application(status: :withdrawn),
        create_application(status: :new_draft),
        create_application(status: :revisions_requested),
        create_application(
          status: :newly_submitted,
          jurisdiction: other_jurisdiction
        ),
        create_application(status: :newly_submitted, sandbox: published_sandbox)
      ]

      scoped_ids = resolved_scope.ids

      candidates.each do |record|
        expect(scoped_ids.include?(record.id)).to eq(policy(record).index?),
        "#{record.status} / jurisdiction=#{record.jurisdiction_id} / sandbox=#{record.sandbox_id}"
      end
    end
  end
end
