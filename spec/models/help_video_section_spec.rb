require "rails_helper"

RSpec.describe HelpVideoSection, type: :model do
  describe "associations" do
    it { should have_many(:help_videos) }
  end

  describe "validations" do
    it { should validate_presence_of(:title) }
    it { should validate_numericality_of(:sort_order).only_integer }
  end

  describe ".ordered" do
    it "sorts by sort_order then creation time" do
      later = create(:help_video_section, sort_order: 2)
      earlier = create(:help_video_section, sort_order: 1)

      expect(described_class.ordered).to eq([earlier, later])
    end
  end

  describe "list ordering" do
    it "adds new sections to the bottom of the list" do
      create(:help_video_section, sort_order: 0)

      section = create(:help_video_section)

      expect(section.sort_order).to eq(1)
    end
  end

  describe ".default_section" do
    it "finds or creates the default section" do
      section = described_class.default_section

      expect(section.title).to eq("Uncategorized")
      expect(section).to be_persisted
    end
  end

  describe "destroying a section" do
    it "moves videos to the default section" do
      section = create(:help_video_section)
      video = create(:help_video, help_video_section: section)

      section.destroy!

      expect(video.reload.help_video_section).to eq(
        described_class.default_section
      )
    end

    it "does not allow deleting the default section" do
      section = described_class.default_section
      create(:help_video, help_video_section: section)

      expect { section.destroy! }.to raise_error(
        ActiveRecord::RecordNotDestroyed
      )
    end
  end
end
