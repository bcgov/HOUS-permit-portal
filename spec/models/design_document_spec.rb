require "rails_helper"

RSpec.describe DesignDocument, type: :model do
  describe "associations" do
    it { should belong_to(:pre_check).inverse_of(:design_documents) }
  end

  describe "validations" do
    it { should validate_presence_of(:pre_check) }
  end

  describe "#attached_to" do
    it "returns the pre_check" do
      document = create(:design_document)
      expect(document.attached_to).to eq(document.pre_check)
    end
  end
end
