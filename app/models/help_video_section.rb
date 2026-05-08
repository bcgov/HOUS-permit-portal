class HelpVideoSection < ApplicationRecord
  has_many :help_videos, dependent: :destroy

  validates :title, presence: true
  validates :sort_order, numericality: { only_integer: true }
  validates :sort_order, uniqueness: true

  scope :ordered, -> { order(:sort_order, :created_at) }
  scope :with_published_videos,
        -> { joins(:help_videos).merge(HelpVideo.published).distinct }
end
