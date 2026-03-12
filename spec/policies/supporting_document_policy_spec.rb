require "rails_helper"

RSpec.describe SupportingDocumentPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#download?" do
    it "permits submitter" do
      submitter = create(:user, :submitter)
      pa =
        instance_double(
          "PermitApplication",
          submitter_id: submitter.id,
          jurisdiction: jurisdiction
        )
      record = instance_double("SupportingDocument", permit_application: pa)

      expect(policy(submitter, record).download?).to be true
    end

    it "permits review staff in the same jurisdiction" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      submitter = create(:user, :submitter)
      pa =
        instance_double(
          "PermitApplication",
          submitter_id: submitter.id,
          jurisdiction: jurisdiction
        )
      record = instance_double("SupportingDocument", permit_application: pa)

      expect(policy(reviewer, record).download?).to be true
    end

    it "denies review staff outside the jurisdiction" do
      reviewer =
        create(:user, :review_manager, jurisdiction: create(:sub_district))
      submitter = create(:user, :submitter)
      pa =
        instance_double(
          "PermitApplication",
          submitter_id: submitter.id,
          jurisdiction: jurisdiction
        )
      record = instance_double("SupportingDocument", permit_application: pa)

      expect(policy(reviewer, record).download?).to be false
    end
  end

  it "permits upload for anyone" do
    pa =
      instance_double(
        "PermitApplication",
        submitter_id: "x",
        jurisdiction: jurisdiction
      )
    record = instance_double("SupportingDocument", permit_application: pa)
    expect(policy(nil, record).upload?).to be true
  end

  it "permits destroy only for submitter" do
    submitter = create(:user, :submitter)
    pa =
      instance_double(
        "PermitApplication",
        submitter_id: submitter.id,
        jurisdiction: jurisdiction
      )
    record = instance_double("SupportingDocument", permit_application: pa)

    expect(policy(submitter, record).destroy?).to be true
    expect(policy(create(:user), record).destroy?).to be false
  end
end
