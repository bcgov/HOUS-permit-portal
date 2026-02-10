require "rails_helper"

RSpec.describe RequirementDocument, type: :model do
  describe "associations" do
    subject { build(:requirement_document) }

    it { should belong_to(:requirement_block) }
  end

  describe "validations" do
    it { should validate_presence_of(:requirement_block) }
  end

  describe "instance methods" do
    describe "#attached_to" do
      it "returns the requirement_block" do
        doc = build(:requirement_document)
        expect(doc.attached_to).to eq(doc.requirement_block)
      end
    end
  end
end
