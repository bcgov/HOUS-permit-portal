require "rails_helper"

RSpec.describe HelpVideo, type: :model do
  describe "associations" do
    it { should belong_to(:help_video_section) }
    it { should have_many(:documents).dependent(:destroy) }
    it { should have_one(:video_document).dependent(:destroy) }
    it { should have_one(:caption_document).dependent(:destroy) }
    it { should have_one(:transcript_document).dependent(:destroy) }
  end

  describe "validations" do
    it { should validate_presence_of(:help_video_section) }
    it { should validate_presence_of(:title) }
    it { should validate_numericality_of(:sort_order).only_integer }

    it "requires a video document before publishing" do
      video = build(:help_video, published_at: Time.current)
      video.caption_document =
        build(:help_video_caption_document, help_video: video)

      expect(video).not_to be_valid
      expect(video.errors[:base]).to include(
        "Video file must exist before publishing"
      )
    end

    it "requires a caption document before publishing" do
      video = build(:help_video, published_at: Time.current)
      video.video_document =
        build(:help_video_video_document, help_video: video)

      expect(video).not_to be_valid
      expect(video.errors[:base]).to include(
        "Caption file must exist before publishing"
      )
    end

    it "allows publishing with required video and caption documents" do
      video = build(:help_video, :published)

      expect(video).to be_valid
    end

    it "does not allow publishing while required documents are pending scan" do
      video = build(:help_video, :published)
      video.video_document.scan_status = "pending"

      expect(video).not_to be_valid
      expect(video.errors[:base]).to include(
        "Video file must exist before publishing"
      )
    end
  end

  describe "list ordering" do
    it "adds new videos to the bottom of their section list" do
      section = create(:help_video_section)
      create(:help_video, help_video_section: section, sort_order: 0)

      video = create(:help_video, help_video_section: section)

      expect(video.sort_order).to eq(1)
    end
  end
end
