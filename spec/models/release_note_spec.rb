require "rails_helper"

is_required = "is required"

RSpec.describe ReleaseNote, type: :model do
  describe "#status" do
    it "defaults to draft" do
      expect(create(:release_note)).to be_draft
    end
  end

  describe "#version" do
    it is_required do
      expect(build(:release_note, version: nil)).not_to be_valid
    end

    it "is invalid with an invalid version" do
      expect(
        build(:release_note, version: "#{Faker::App.semantic_version}.0")
      ).not_to be_valid
    end

    it "is invalid with a non-unique version" do
      create(:release_note, version: "1.0.0")
      expect(build(:release_note, version: "1.0.0")).not_to be_valid
    end
  end

  describe "#release_notes_url" do
    it is_required do
      expect(build(:release_note, release_notes_url: nil)).not_to be_valid
    end

    it "is invalid with an invalid url" do
      expect(
        build(:release_note, release_notes_url: "not_a_url")
      ).not_to be_valid
    end
  end

  describe "#release_date" do
    it is_required do
      expect(build(:release_note, release_date: nil)).not_to be_valid
    end
  end

  describe "#content" do
    it is_required do
      expect(build(:release_note, content: nil)).not_to be_valid
    end
  end
end
