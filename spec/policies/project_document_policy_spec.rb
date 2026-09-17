require "rails_helper"

RSpec.describe ProjectDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:jurisdiction) { create(:sub_district) }
  let(:owner) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits download for the project owner of an unlinked document" do
    record = create(:project_document, permit_project: permit_project)
    expect(policy(owner, record).download?).to be true
    expect(policy(other_user, record).download?).to be false
  end

  it "permits download for review staff of the jurisdiction" do
    record = create(:project_document, permit_project: permit_project)
    expect(policy(reviewer, record).download?).to be true
  end

  it "hides draft reference attachments from the submitter until the package is sent" do
    application =
      create(
        :permit_application,
        :newly_submitted,
        submitter: owner,
        jurisdiction: jurisdiction,
        permit_project: permit_project
      )
    request =
      create(
        :supporting_information_request,
        submission_version: application.latest_submission_version
      )
    record =
      create(
        :project_document,
        permit_project: permit_project,
        supporting_information_request: request,
        kind: :reference
      )

    expect(policy(owner, record).download?).to be false
    expect(policy(reviewer, record).download?).to be true

    allow(NotificationService).to receive(
      :publish_application_revisions_request_event
    )
    application.finalize_revision_requests!

    expect(policy(owner, record.reload).download?).to be true
  end

  it "denies download when permit_project is missing" do
    record = instance_double("ProjectDocument", permit_project: nil)
    expect(policy(owner, record).download?).to be false
  end
end
