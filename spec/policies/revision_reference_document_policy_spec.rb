require "rails_helper"

RSpec.describe RevisionReferenceDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:jurisdiction) { create(:sub_district) }
  let(:owner) { create(:user, :submitter) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:application) do
    create(
      :permit_application,
      :newly_submitted,
      submitter: owner,
      jurisdiction: jurisdiction,
      permit_project: permit_project
    )
  end
  let(:request) do
    create(
      :supporting_document_revision_request,
      submission_version: application.latest_submission_version
    )
  end
  let(:record) do
    create(:revision_reference_document, revision_request: request)
  end

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "hides reference files from the submitter until the package is sent" do
    expect(policy(owner).download?).to be false
    expect(policy(reviewer).download?).to be true

    allow(NotificationService).to receive(
      :publish_application_revisions_request_event
    )
    application.finalize_revision_requests!

    expect(policy(owner).download?).to be true
  end
end
