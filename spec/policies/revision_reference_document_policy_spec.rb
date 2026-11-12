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

  it "hides reference files from members until the package is sent" do
    expanded = create(:user, :submitter)
    standard = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: permit_project,
      user: expanded,
      access: :expanded
    )
    create(
      :project_membership,
      permit_project: permit_project,
      user: standard,
      access: :standard
    )

    expect(policy(owner).download?).to be false
    expect(policy(expanded).download?).to be false
    expect(policy(standard).download?).to be false
    expect(policy(reviewer).download?).to be true

    allow(NotificationService).to receive(
      :publish_application_revisions_request_event
    )
    application.finalize_revision_requests!

    expect(policy(owner).download?).to be true
    expect(policy(expanded).download?).to be true
    expect(policy(standard).download?).to be false
    expect(policy(create(:user, :submitter)).download?).to be false
  end

  it "download? denies a Full member of a different project" do
    outsider = create(:user, :submitter)
    other_application =
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: jurisdiction,
        sandbox: permit_project.sandbox
      )
    expect(
      other_application.permit_project.project_memberships.find_by!(
        user: outsider
      )
    ).to be_full

    record
    allow(NotificationService).to receive(
      :publish_application_revisions_request_event
    )
    application.finalize_revision_requests!

    expect(policy(owner).download?).to be true
    expect(policy(outsider).download?).to be false
  end
end
