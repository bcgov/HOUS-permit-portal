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

    it "cannot be changed once the release note is published" do
      release_note = create(:release_note, status: :published, version: "1.0.0")
      release_note.version = "1.0.1"
      expect(release_note).not_to be_valid
      expect(release_note.errors[:version]).to be_present
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

  describe "scopes" do
    it "returns published release notes" do
      published_release_note = create(:release_note, status: :published)
      draft_release_note = create(:release_note, status: :draft)
      expect(ReleaseNote.published).to include(published_release_note)
      expect(ReleaseNote.published).not_to include(draft_release_note)
    end
  end

  describe "#publish_event_notification_data" do
    it "returns notification payload referencing the release note" do
      release_note = create(:release_note, status: :published)

      data = release_note.publish_event_notification_data

      expect(data).to include(
        "action_type" =>
          Constants::NotificationActionTypes::RELEASE_NOTE_PUBLISH
      )
      expect(data["action_text"]).to include(release_note.version)
      expect(data["object_data"]).to include(
        "release_note_id" => release_note.id,
        "version" => release_note.version
      )
    end
  end
end
