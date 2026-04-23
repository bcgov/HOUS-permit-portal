require "rails_helper"

RSpec.describe ReleaseNote, type: :model do
  describe "#status" do
    it "defaults to draft" do
      expect(create(:release_note)).to be_draft
    end
  end
end
