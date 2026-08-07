require "rails_helper"

is_required = "is required"

RSpec.describe ReleaseNote, type: :model do
  describe "#status" do
    it "defaults to draft" do
      expect(create(:release_note)).to be_draft
    end
  end

  describe "software validations" do
    it "requires a version" do
      expect(build(:release_note, version: nil)).not_to be_valid
    end

    it "is invalid with an invalid version" do
      expect(
        build(:release_note, version: "#{Faker::App.semantic_version}.0")
      ).not_to be_valid
    end

    it "is invalid with a non-unique version among software releases" do
      create(:release_note, version: "1.0.0")
      expect(build(:release_note, version: "1.0.0")).not_to be_valid
    end

    it "allows content releases without a version" do
      create(:release_note, version: "1.0.0")
      expect(
        build(:release_note, :content, name: "Step Code wording")
      ).to be_valid
    end

    it "cannot change version once the release note is published" do
      release_note = create(:release_note, status: :published, version: "1.0.0")
      release_note.version = "1.0.1"
      expect(release_note).not_to be_valid
      expect(release_note.errors[:version]).to be_present
    end

    it "requires a release notes url" do
      expect(build(:release_note, release_notes_url: nil)).not_to be_valid
    end

    it "is invalid with an invalid url" do
      expect(
        build(:release_note, release_notes_url: "not_a_url")
      ).not_to be_valid
    end
  end

  describe "content validations" do
    it "requires a name" do
      expect(build(:release_note, :content, name: nil)).not_to be_valid
    end

    it "does not require a release notes url" do
      expect(
        build(:release_note, :content, name: "Step Code wording")
      ).to be_valid
    end
  end

  describe "clearing inactive type-specific attributes" do
    it "nulls name on software notes" do
      release_note = create(:release_note, name: "should be cleared")

      expect(release_note.reload.name).to be_nil
    end

    it "nulls version and release_notes_url on content notes" do
      release_note =
        create(
          :release_note,
          :content,
          name: "Step Code wording",
          version: "1.2.3",
          release_notes_url: "https://example.com/notes"
        )

      expect(release_note.reload.version).to be_nil
      expect(release_note.reload.release_notes_url).to be_nil
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

  describe "type immutability" do
    it "cannot change release type once saved" do
      release_note = create(:release_note)
      release_note.release_type = :content
      release_note.name = "Other"

      expect(release_note).not_to be_valid
      expect(release_note.errors[:release_type]).to be_present
    end
  end

  describe "same-day multi-release" do
    it "allows software and content notes on the same release date" do
      release_date = Time.zone.parse("2026-06-15 12:00:00")

      expect(
        create(:release_note, release_date: release_date, version: "0.1.2")
      ).to be_persisted
      expect(
        create(
          :release_note,
          :content,
          release_date: release_date,
          name: "Step Code wording"
        )
      ).to be_persisted
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
    it "returns notification payload with software label" do
      release_note = create(:release_note, status: :published, version: "1.2.3")

      data = release_note.publish_event_notification_data

      expect(data).to include(
        "action_type" =>
          Constants::NotificationActionTypes::RELEASE_NOTE_PUBLISH
      )
      expect(data["action_text"]).to include("1.2.3")
      expect(data["object_data"]).to include(
        "release_note_id" => release_note.id,
        "release_type" => "software",
        "label" => "1.2.3"
      )
    end

    it "returns notification payload with content label" do
      release_note =
        create(
          :release_note,
          :content,
          status: :published,
          name: "Step Code wording"
        )

      data = release_note.publish_event_notification_data

      expect(data["action_text"]).to include("Step Code wording")
      expect(data["object_data"]).to include(
        "release_note_id" => release_note.id,
        "release_type" => "content",
        "label" => "Step Code wording"
      )
    end
  end
end
