require "rails_helper"

RSpec.describe MeetingRequestDocument, type: :model do
  describe "associations" do
    subject { build(:meeting_request_document) }

    it { should belong_to(:project_meeting) }
  end

  describe "validations" do
    it { should validate_presence_of(:project_meeting) }
  end

  describe "#attached_to" do
    it "returns the project meeting" do
      document = build(:meeting_request_document)

      expect(document.attached_to).to eq(document.project_meeting)
    end
  end
end
