require "rails_helper"

RSpec.describe MeetingRequestDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:jurisdiction) { create(:sub_district) }
  let(:owner) { create(:user, :submitter) }
  let(:other_user) { create(:user, :submitter) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:permit_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:project_meeting) do
    create(:project_meeting, permit_project: permit_project)
  end
  let(:document) { create(:meeting_request_document, project_meeting:) }

  def policy(user, record = document)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits download for the project owner" do
    expect(policy(owner).download?).to be true
  end

  it "permits download for jurisdiction review staff on submitted meetings" do
    submitted_meeting =
      create(:project_meeting, :open, permit_project: permit_project)
    submitted_document =
      create(:meeting_request_document, project_meeting: submitted_meeting)

    expect(policy(reviewer, submitted_document).download?).to be true
  end

  it "blocks download for jurisdiction review staff on draft meetings" do
    expect(policy(reviewer).download?).to be false
  end

  it "blocks download for other users" do
    expect(policy(other_user).download?).to be false
  end

  it "blocks download for review staff from another jurisdiction" do
    other_reviewer =
      create(:user, :reviewer, jurisdiction: create(:sub_district))

    expect(policy(other_reviewer).download?).to be false
  end

  it "blocks download without a project meeting" do
    record = instance_double("MeetingRequestDocument", project_meeting: nil)

    expect(policy(owner, record).download?).to be false
  end
end
