class HelpVideoSection < ApplicationRecord
  DEFAULT_SECTION_TITLE = "Uncategorized"

  has_many :help_videos

  acts_as_list column: :sort_order, top_of_list: 0

  before_destroy :move_help_videos_to_default_section, prepend: true

  validates :title, presence: true
  validates :sort_order, numericality: { only_integer: true }

  scope :ordered, -> { order(:sort_order, :created_at) }
  scope :with_published_videos,
        -> { joins(:help_videos).merge(HelpVideo.published).distinct }

  def self.default_section
    find_or_create_by!(title: DEFAULT_SECTION_TITLE) do |section|
      section.description = "Videos without an assigned section."
    end
  end

  def default_section?
    title == DEFAULT_SECTION_TITLE
  end

  private

  def move_help_videos_to_default_section
    if default_section?
      errors.add(:base, "Default help video section cannot be deleted")
      throw(:abort)
    end

    default_section = self.class.default_section
    help_videos.update_all(
      help_video_section_id: default_section.id,
      updated_at: Time.current
    )
  end
end
