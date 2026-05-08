require "rails_helper"

RSpec.describe HelpVideoDocument, type: :model do
  describe "associations" do
    it { should belong_to(:help_video) }
  end

  describe "validations" do
    it "accepts MP4 files for video documents" do
      document = build(:help_video_video_document)

      expect(document).to be_valid
    end

    it "rejects non-MP4 files for video documents" do
      document = build(:help_video_video_document)
      document.file_data["metadata"]["filename"] = "video.mov"
      document.file_data["metadata"]["mime_type"] = "video/quicktime"

      expect(document).not_to be_valid
      expect(document.errors[:file]).to be_present
    end

    it "accepts WebVTT files for caption documents" do
      document = build(:help_video_caption_document)

      expect(document).to be_valid
    end

    it "rejects non-WebVTT files for caption documents" do
      document = build(:help_video_caption_document)
      document.file_data["metadata"]["filename"] = "captions.srt"

      expect(document).not_to be_valid
      expect(document.errors[:file]).to be_present
    end

    it "accepts text transcript documents" do
      document = build(:help_video_transcript_document)

      expect(document).to be_valid
    end
  end
end
