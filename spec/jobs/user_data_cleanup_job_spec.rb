require "rails_helper"

RSpec.describe UserDataCleanupJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  # This job handles the entire lifecycle of user data retention:
  # 1. Warns active users before they are archived (discarded).
  # 2. Archives (discards) users who have been inactive for too long.
  # 3. Warns discarded users before they are permanently deleted.
  # 4. Permanently deletes users who have been discarded for too long.
  describe "#perform" do
    include ActiveJob::TestHelper

    # Setup time and configuration constants for testing
    let(:now) { Time.current }
    let(:archive_after) { 1095 } # 3 years
    let(:delete_after) { 1095 } # 3 years after discard (total 6 years)
    let(:archive_warn_days) { [30, 7] } # Warn 30 and 7 days before archiving
    let(:delete_warn_days) { [30, 7] } # Warn 30 and 7 days before deleting

    before do
      # Spy on the mailer to verify emails are sent
      allow(PermitHubMailer).to receive(
        :notify_user_archive_warning
      ).and_call_original
      allow(PermitHubMailer).to receive(
        :notify_user_delete_warning
      ).and_call_original

      # Mock ENV variables to use our test values instead of real config
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with(
        "USER_ARCHIVE_AFTER_DAYS",
        anything
      ).and_return(archive_after.to_s)
      allow(ENV).to receive(:fetch).with(
        "USER_DELETE_AFTER_DAYS",
        anything
      ).and_return(delete_after.to_s)
      allow(ENV).to receive(:[])
      allow(ENV).to receive(:[]).with("USER_ARCHIVE_WARNING_DAYS").and_return(
        archive_warn_days.join(",")
      )
      allow(ENV).to receive(:[]).with("USER_DELETE_WARNING_DAYS").and_return(
        delete_warn_days.join(",")
      )
    end

    # ==========================================
    # PHASE 1: Archiving (Soft Delete) Logic
    # ==========================================
    context "archiving users" do
      # User who signed in recently -> Should be safe
      let!(:active_user) do
        create(:user, last_sign_in_at: now - (archive_after - 1).days)
      end
      # User inactive for > 3 years -> Should be archived
      let!(:user_to_archive) do
        create(:user, last_sign_in_at: now - (archive_after + 1).days)
      end
      # User already archived -> Should be ignored by this step
      let!(:already_discarded_user) do
        create(
          :user,
          :discarded,
          last_sign_in_at: now - (archive_after + 1).days
        )
      end

      it "discards users inactive for longer than the configured days" do
        travel_to(now) { subject.perform }
        expect(user_to_archive.reload).to be_discarded
      end

      it "does not discard active users" do
        travel_to(now) { subject.perform }
        expect(active_user.reload).not_to be_discarded
      end

      it "does not touch already discarded users" do
        expect { travel_to(now) { subject.perform } }.not_to change {
          already_discarded_user.reload.discarded_at
        }
      end
    end

    # ==========================================
    # PHASE 2: Archive Warnings
    # ==========================================
    context "sending archive warnings" do
      # User approaching the 30-day warning threshold
      let!(:user_warn_30) do
        create(
          :user,
          last_sign_in_at: now - (archive_after - 30).days,
          discarded_at: nil
        )
      end
      # User approaching the 7-day warning threshold
      let!(:user_warn_7) do
        create(
          :user,
          last_sign_in_at: now - (archive_after - 7).days,
          discarded_at: nil
        )
      end
      # User in between warnings -> Should receive nothing
      let!(:user_no_warn) do
        create(
          :user,
          last_sign_in_at: now - (archive_after - 15).days,
          discarded_at: nil
        )
      end

      it "sends warning email 30 days before archival" do
        travel_to(now) { subject.perform }

        expect(PermitHubMailer).to have_received(
          :notify_user_archive_warning
        ).with(user_warn_30, 30)
      end

      it "sends warning email 7 days before archival" do
        travel_to(now) { subject.perform }

        expect(PermitHubMailer).to have_received(
          :notify_user_archive_warning
        ).with(user_warn_7, 7)
      end

      it "does not send warning for other days" do
        travel_to(now) { perform_enqueued_jobs { subject.perform } }

        expect(PermitHubMailer).not_to have_received(
          :notify_user_archive_warning
        ).with(user_no_warn, anything)
      end
    end

    # ==========================================
    # PHASE 3: Permanent Deletion Logic
    # ==========================================
    context "deleting discarded users" do
      # User discarded recently -> Should be safe
      let!(:recently_discarded_user) do
        create(:user, :discarded, discarded_at: now - (delete_after - 1).days)
      end
      # User discarded > 3 years ago -> Should be deleted
      let!(:user_to_delete) do
        create(:user, :discarded, discarded_at: now - (delete_after + 1).days)
      end

      # Setup public record data (e.g. Submitted Permit)
      # This should be PRESERVED (orphaned) when user is deleted
      let!(:permit_application) do
        create(:permit_application, :newly_submitted, submitter: user_to_delete)
      end

      # Setup non-public record data (e.g. Draft Permit)
      # This should be DELETED when user is deleted
      let!(:draft_application) do
        create(
          :permit_application,
          submitter: user_to_delete,
          status: :new_draft
        )
      end

      it "permanently deletes users discarded longer than retention period" do
        travel_to(now) { subject.perform }
        expect { user_to_delete.reload }.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end

      it "does not delete recently discarded users" do
        travel_to(now) { subject.perform }
        expect(recently_discarded_user.reload).to be_present
      end

      it "orphans public records and takes snapshots" do
        # Ensure permit application is public record
        expect(permit_application).to be_public_record

        travel_to(now) { subject.perform }

        permit_application.reload
        # Verify the link to the user is gone
        expect(permit_application.submitter_id).to be_nil
        # Verify snapshots were taken
        expect(permit_application.omniauth_username_snapshot).to be_present
        expect(permit_application.first_name_snapshot).to be_present
        expect(permit_application.orphaned_at).to be_present
        # Check that we can access the "submitter" via the readonly User
        expect(permit_application.submitter).to be_a(User)
        expect(permit_application.submitter).to be_readonly
        expect(permit_application.submitter.name).to eq(
          "#{user_to_delete.first_name} #{user_to_delete.last_name}"
        )
      end

      it "cascades delete for non-public records (drafts)" do
        expect(draft_application).not_to be_public_record

        travel_to(now) { subject.perform }

        # Draft should be gone because it belongs_to user (dependent: :destroy)
        expect { draft_application.reload }.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end

      context "when deletion fails" do
        before do
          allow_any_instance_of(User).to receive(:destroy!).and_raise(
            ActiveRecord::InvalidForeignKey
          )
          allow(Rails.logger).to receive(:error)
        end

        it "logs the error and continues without raising" do
          expect { subject.perform }.not_to raise_error
          expect(Rails.logger).to have_received(:error).with(
            /FAILED to delete user/
          )
        end
      end
    end

    # ==========================================
    # PHASE 4: Delete Warnings
    # ==========================================
    context "sending delete warnings" do
      # Discarded user approaching the 30-day deletion threshold
      let!(:user_warn_30) do
        create(
          :user,
          :discarded,
          discarded_at: now - (delete_after - 30).days,
          last_sign_in_at: 5.years.ago
        )
      end
      # Discarded user approaching the 7-day deletion threshold
      let!(:user_warn_7) do
        create(
          :user,
          :discarded,
          discarded_at: now - (delete_after - 7).days,
          last_sign_in_at: 5.years.ago
        )
      end

      it "sends warning email 30 days before deletion" do
        travel_to(now) { subject.perform }

        expect(PermitHubMailer).to have_received(
          :notify_user_delete_warning
        ).with(user_warn_30, 30)
      end

      it "sends warning email 7 days before deletion" do
        travel_to(now) { subject.perform }

        expect(PermitHubMailer).to have_received(
          :notify_user_delete_warning
        ).with(user_warn_7, 7)
      end
    end
  end
end
