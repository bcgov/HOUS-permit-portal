# spec/models/submission_version_spec.rb
require "rails_helper"

RSpec.describe SubmissionVersion, type: :model do
  describe "Scopes" do
    # Create sandboxed and non-sandboxed permit applications
    let!(:jurisdiction) { create(:sub_district) }
    let!(:sandbox) { jurisdiction.sandboxes.published.first }
    let!(:sandboxed_application) do
      create(:permit_application, sandbox: sandbox, jurisdiction: jurisdiction)
    end
    let!(:live_application) do
      create(:permit_application, jurisdiction: jurisdiction)
    end

    # Create submission versions associated with the permit applications
    let!(:sandboxed_submission) do
      create(:submission_version, permit_application: sandboxed_application)
    end
    let!(:live_submission) do
      create(:submission_version, permit_application: live_application)
    end

    describe ".all" do
      it "returns only submission versions associated with non-sandboxed permit applications due to live scope" do
        expect(SubmissionVersion.live).to include(live_submission)
        expect(SubmissionVersion.live).not_to include(sandboxed_submission)
      end
    end

    describe ".sandboxed" do
      it "returns only submission versions associated with sandboxed permit applications" do
        expect(SubmissionVersion.sandboxed).to include(sandboxed_submission)
        expect(SubmissionVersion.sandboxed).not_to include(live_submission)
      end
    end

    describe ".live" do
      it "returns only submission versions associated with non-sandboxed permit applications" do
        expect(SubmissionVersion.live).to include(live_submission)
        expect(SubmissionVersion.live).not_to include(sandboxed_submission)
      end
    end

    describe "Default Scope" do
      it "includes all submission versions" do
        expect(SubmissionVersion.all).to include(sandboxed_submission)
        expect(SubmissionVersion.all).to include(live_submission)
      end
    end
  end

  describe "#has_request_package_items?" do
    let(:submission_version) { create(:submission_version) }

    it "is false when the package is empty" do
      expect(submission_version.has_request_package_items?).to be false
    end

    it "is true when a supporting document revision request is present" do
      create(
        :supporting_document_revision_request,
        submission_version: submission_version
      )
      expect(submission_version.has_request_package_items?).to be true
    end
  end

  describe "#request_package_visible_to_submitter?" do
    let(:permit_application) { create(:permit_application, :newly_submitted) }
    let(:submission_version) { permit_application.latest_submission_version }

    it "is false for draft items on the latest version" do
      expect(submission_version.request_package_visible_to_submitter?).to be(
        false
      )
    end

    it "is true after revisions are requested" do
      create(
        :supporting_document_revision_request,
        submission_version: submission_version
      )
      allow(NotificationService).to receive(
        :publish_application_revisions_request_event
      )
      permit_application.finalize_revision_requests!

      expect(
        submission_version.request_package_visible_to_submitter?
      ).to be true
    end
  end
end
