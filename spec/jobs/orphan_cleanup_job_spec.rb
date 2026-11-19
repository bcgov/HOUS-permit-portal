require "rails_helper"

RSpec.describe OrphanCleanupJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  # This job is the final stage of the lifecycle.
  # It deletes records that were "orphaned" (anonymized) a long time ago.
  # For example, if we keep public records for 4 years after the user is deleted
  it "has no unique lock so retries are not suppressed" do
    opts = described_class.get_sidekiq_options
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

  describe "#perform" do
    let(:now) { Time.current }
    let(:retention_days) { 1460 } # 4 years

    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with(
        "ORPHAN_DELETE_AFTER_DAYS",
        anything
      ).and_return(retention_days.to_s)
    end

    context "cleaning up orphaned public records" do
      let!(:user) { create(:user) }

      # Record orphaned recently -> Should be KEPT
      let!(:recent_orphan) do
        create(
          :permit_application,
          :newly_submitted,
          submitter: nil,
          orphaned_at: now - (retention_days - 1).days
        )
      end

      # Record orphaned > 4 years ago -> Should be DELETED
      let!(:old_orphan) do
        create(
          :permit_application,
          :newly_submitted,
          submitter: nil,
          orphaned_at: now - (retention_days + 1).days
        )
      end

      # Normal record with a user -> Should be IGNORED
      let!(:non_orphan) do
        create(:permit_application, :newly_submitted, submitter: user)
      end

      it "deletes records orphaned longer than retention period" do
        subject.perform
        expect { old_orphan.reload }.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end

      it "keeps records orphaned less than retention period" do
        subject.perform
        expect(recent_orphan.reload).to be_present
      end

      it "keeps non-orphaned records" do
        subject.perform
        expect(non_orphan.reload).to be_present
      end

      it "deletes discarded records orphaned longer than the retention period" do
        discarded_old =
          create(:permit_application, :newly_submitted, submitter: nil)
        discarded_recent =
          create(:permit_application, :newly_submitted, submitter: nil)
        discarded_old.update_columns(
          orphaned_at: now - (retention_days + 1).days,
          discarded_at: now - (retention_days + 1).days
        )
        discarded_recent.update_columns(
          orphaned_at: now - (retention_days - 1).days,
          discarded_at: now - (retention_days - 1).days
        )

        subject.perform

        expect(PermitApplication.unscoped.exists?(discarded_old.id)).to be false
        expect(
          PermitApplication.unscoped.exists?(discarded_recent.id)
        ).to be true
      end

      it "deletes an abandoned project and its applications after the retention period" do
        project = create(:permit_project)
        application =
          create(
            :permit_application,
            :newly_submitted,
            permit_project: project,
            submitter: project.owner,
            jurisdiction: project.jurisdiction
          )
        project.update_columns(
          orphaned_at: now - (retention_days + 1).days,
          discarded_at: now - (retention_days + 1).days
        )
        application.update_columns(
          discarded_at: now - (retention_days + 1).days
        )

        subject.perform

        expect(PermitProject.unscoped.exists?(project.id)).to be false
        expect(PermitApplication.unscoped.exists?(application.id)).to be false
      end

      it "iterates through registered models" do
        # Just checking that it covers multiple types if they exist
        revision_request = create(:revision_request)
        revision_request.update_columns(
          orphaned_at: now - (retention_days + 10).days,
          user_id: nil
        )

        subject.perform
        expect { revision_request.reload }.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end
    end
  end
end
