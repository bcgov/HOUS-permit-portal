# spec/models/submission_version_spec.rb
require "rails_helper"

RSpec.describe SubmissionVersion, type: :model do
  describe "Scopes" do
    # Create sandboxed and non-sandboxed permit applications
    let!(:jurisdiction) { create(:sub_district) }
    let!(:sandbox) { create(:sandbox, jurisdiction: jurisdiction) }
    let!(:sandboxed_application) do
      create(:permit_application, sandbox: sandbox)
    end
    let!(:live_application) { create(:permit_application) }

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
end
