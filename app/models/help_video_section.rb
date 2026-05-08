class HelpVideoSection < ApplicationRecord
  has_many :help_videos, dependent: :destroy

  acts_as_list column: :sort_order, top_of_list: 0

  validates :title, presence: true
  validates :sort_order, numericality: { only_integer: true }

  scope :ordered, -> { order(:sort_order, :created_at) }
  scope :with_published_videos,
        -> { joins(:help_videos).merge(HelpVideo.published).distinct }
end
