require "rails_helper"

RSpec.describe UserDataCleanupJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  describe "#perform" do
    include ActiveJob::TestHelper

    let(:now) { Time.current }
    let(:archive_after) { 1095 }
    let(:delete_after) { 1095 }
    let(:archive_warn_days) { [30, 7] }
    let(:delete_warn_days) { [30, 7] }

    before do
      allow(PermitHubMailer).to receive(
        :notify_user_archive_warning
      ).and_call_original
      allow(PermitHubMailer).to receive(
        :notify_user_delete_warning
      ).and_call_original

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

    context "archiving users" do
      let!(:active_user) do
        create(:user, last_sign_in_at: now - (archive_after - 1).days)
      end
      let!(:user_to_archive) do
        create(:user, last_sign_in_at: now - (archive_after + 1).days)
      end
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

    context "sending archive warnings" do
      let!(:user_warn_30) do
        create(
          :user,
          last_sign_in_at: now - (archive_after - 30).days,
          discarded_at: nil
        )
      end
      let!(:user_warn_7) do
        create(
          :user,
          last_sign_in_at: now - (archive_after - 7).days,
          discarded_at: nil
        )
      end
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

    context "deleting discarded users" do
      let!(:recently_discarded_user) do
        create(:user, :discarded, discarded_at: now - (delete_after - 1).days)
      end
      let!(:user_to_delete) do
        create(:user, :discarded, discarded_at: now - (delete_after + 1).days)
      end

      # Setup public record data
      let!(:permit_application) do
        create(:permit_application, :newly_submitted, submitter: user_to_delete)
      end

      # Setup non-public record data (draft)
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
        expect(permit_application.submitter_id).to be_nil
        expect(permit_application.omniauth_username_snapshot).to be_present
        expect(permit_application.first_name_snapshot).to be_present
        expect(permit_application.orphaned_at).to be_present
        # Check that we can access the "submitter" via the deleted user mock
        expect(permit_application.submitter).to be_a(
          PublicRecordable::DeletedUser
        )
        expect(permit_application.submitter.name).to eq(
          "#{user_to_delete.first_name} #{user_to_delete.last_name}"
        )
      end

      it "cascades delete for non-public records (drafts)" do
        expect(draft_application).not_to be_public_record

        travel_to(now) { subject.perform }

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

    context "sending delete warnings" do
      let!(:user_warn_30) do
        create(
          :user,
          :discarded,
          discarded_at: now - (delete_after - 30).days,
          last_sign_in_at: 5.years.ago
        )
      end
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
