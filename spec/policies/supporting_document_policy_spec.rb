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

  def member_with_access(permit_application, access)
    member = create(:user, :submitter)
    create(
      :project_membership,
      permit_project: permit_application.permit_project,
      user: member,
      access: access
    )
    member
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
    expanded_member = member_with_access(permit_application, :expanded)
    standard_member = member_with_access(permit_application, :standard)

    expect(policy(submitter, record).upload?).to be true
    expect(policy(expanded_member, record).upload?).to be true
    expect(policy(standard_member, record).upload?).to be false
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
    expanded_member = member_with_access(permit_application, :expanded)
    standard_member = member_with_access(permit_application, :standard)

    expect(policy(submitter, record).destroy?).to be true
    expect(policy(expanded_member, record).destroy?).to be true
    expect(policy(standard_member, record).destroy?).to be false
    expect(policy(create(:user), record).destroy?).to be false
  end

  def full_member_of_another_project(jurisdiction)
    outsider = create(:user, :submitter)
    owned =
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: jurisdiction,
        sandbox: sandbox
      )
    target =
      create(:permit_application, jurisdiction: jurisdiction, sandbox: sandbox)
    expect(
      owned.permit_project.project_memberships.find_by!(user: outsider)
    ).to be_full
    [outsider, owned, target]
  end

  it "download? denies a Full member of a different project" do
    outsider, owned, target = full_member_of_another_project(jurisdiction)

    expect(policy(outsider, document_for(owned)).download?).to be true
    expect(policy(outsider, document_for(target)).download?).to be false
  end

  it "upload? denies a Full member of a different project" do
    outsider, owned, target = full_member_of_another_project(jurisdiction)

    expect(policy(outsider, document_for(owned)).upload?).to be true
    expect(policy(outsider, document_for(target)).upload?).to be false
  end

  it "destroy? denies a Full member of a different project" do
    outsider, owned, target = full_member_of_another_project(jurisdiction)

    expect(policy(outsider, document_for(owned)).destroy?).to be true
    expect(policy(outsider, document_for(target)).destroy?).to be false
  end
end
