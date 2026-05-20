require "rails_helper"

RSpec.describe MeetingRequestDocument, type: :model do
  describe "associations" do
    subject { build(:meeting_request_document) }

    it { should belong_to(:project_meeting) }
  end

  describe "validations" do
    it { should validate_presence_of(:project_meeting) }
    it { should validate_presence_of(:document_type) }
  end

  describe "document types" do
    it "defaults to supporting documents" do
      document = described_class.new

      expect(document.document_type).to eq("supporting")
    end
  end

  describe "#attached_to" do
    it "returns the project meeting" do
      document = build(:meeting_request_document)

      expect(document.attached_to).to eq(document.project_meeting)
    end
  end
end
