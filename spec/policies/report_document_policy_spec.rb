require "rails_helper"

RSpec.describe ReportDocumentPolicy, type: :policy do
  def policy(user, record, sandbox = nil)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits a standalone report only for its creator" do
    creator = create(:user, :submitter)
    step_code =
      create(:part_9_step_code, permit_application: nil, creator: creator)
    document = create(:report_document, step_code: step_code)

    expect(policy(creator, document).download?).to be true
    expect(policy(creator, document).share?).to be true
    expect(policy(create(:user, :submitter), document).download?).to be false
    expect(policy(create(:user, :submitter), document).share?).to be false
    expect(policy(nil, document).download?).to be false
    expect(policy(nil, document).share?).to be false
  end

  it "follows Step Code show for download and edit for share" do
    jurisdiction = create(:sub_district)
    sandbox = jurisdiction.sandboxes.published.first
    creator = create(:user, :submitter)
    author = create(:user, :submitter)
    expanded = create(:user, :submitter)
    standard = create(:user, :submitter)
    reviewer = create(:user, :review_manager, jurisdiction: jurisdiction)
    application =
      create(
        :permit_application,
        submitter: creator,
        jurisdiction: jurisdiction,
        sandbox: sandbox,
        with_fake_plan_document: true
      )
    create(
      :project_membership,
      permit_project: application.permit_project,
      user: expanded,
      access: :expanded
    )
    create(
      :project_membership,
      permit_project: application.permit_project,
      user: standard,
      access: :standard
    )
    step_code =
      create(
        :part_9_step_code,
        permit_application: application,
        creator: author
      )
    document = create(:report_document, step_code: step_code)

    expect(policy(expanded, document, sandbox).download?).to be true
    expect(policy(expanded, document, sandbox).share?).to be true
    expect(policy(standard, document, sandbox).download?).to be false
    expect(policy(standard, document, sandbox).share?).to be false
    expect(policy(author, document, sandbox).download?).to be false
    expect(policy(author, document, sandbox).share?).to be false
    expect(policy(reviewer, document, sandbox).download?).to be true
    expect(policy(reviewer, document, sandbox).share?).to be false
  end
end
