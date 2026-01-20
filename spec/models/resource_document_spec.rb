require "rails_helper"

RSpec.describe ResourceDocument, type: :model do
  describe "associations" do
    subject { build(:resource_document) }

    it { should belong_to(:resource).touch(true) }
  end

  describe "validations" do
    it { should validate_presence_of(:resource) }
  end

  describe "instance methods" do
    describe "#attached_to" do
      it "returns the resource" do
        doc = build(:resource_document)
        expect(doc.attached_to).to eq(doc.resource)
      end
    end
  end
end
