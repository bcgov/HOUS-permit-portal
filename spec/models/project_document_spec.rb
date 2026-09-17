require "rails_helper"

RSpec.describe ProjectDocument, type: :model do
  describe "associations" do
    subject { build(:project_document) }

    it { should belong_to(:permit_project) }
    it { should belong_to(:supporting_information_request).optional }
    it { should belong_to(:uploaded_by).class_name("User").optional }
  end

  describe "validations" do
    it { should validate_presence_of(:permit_project) }
  end

  describe "instance methods" do
    describe "#attached_to" do
      it "returns the permit_project" do
        doc = build(:project_document)
        expect(doc.attached_to).to eq(doc.permit_project)
      end
    end
  end
end
