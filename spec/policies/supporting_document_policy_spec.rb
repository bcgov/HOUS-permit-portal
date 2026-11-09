require "rails_helper"

RSpec.describe SupportingDocumentPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  def document_for(permit_application)
    instance_double(
      "SupportingDocument",
      permit_application: permit_application
    )
  end

  describe "#download?" do
    it "permits a member who can view the application" do
      submitter = create(:user, :submitter)
      permit_application =
        create(
          :permit_application,
          submitter: submitter,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )

      expect(
        policy(submitter, document_for(permit_application)).download?
      ).to be true
    end

    it "permits review staff in the same jurisdiction" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      permit_application =
        create(
          :permit_application,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )

      expect(
        policy(reviewer, document_for(permit_application)).download?
      ).to be true
    end

    it "denies review staff outside the jurisdiction" do
      reviewer =
        create(:user, :review_manager, jurisdiction: create(:sub_district))
      permit_application =
        create(
          :permit_application,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )

      expect(
        policy(reviewer, document_for(permit_application)).download?
      ).to be false
    end
  end

  it "permits upload for a member who can edit the application" do
    submitter = create(:user, :submitter)
    permit_application =
      create(
        :permit_application,
        submitter: submitter,
        jurisdiction: jurisdiction,
        sandbox: sandbox
      )
    record = document_for(permit_application)

    expect(policy(submitter, record).upload?).to be true
    expect(policy(nil, record).upload?).to be false
  end

  it "permits destroy for a member who can edit the application" do
    submitter = create(:user, :submitter)
    permit_application =
      create(
        :permit_application,
        submitter: submitter,
        jurisdiction: jurisdiction,
        sandbox: sandbox
      )
    record = document_for(permit_application)

    expect(policy(submitter, record).destroy?).to be true
    expect(policy(create(:user), record).destroy?).to be false
  end
end
