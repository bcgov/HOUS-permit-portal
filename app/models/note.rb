class Note < ApplicationRecord
  NOTEABLE_TYPES = %w[ProjectMeeting].freeze

  belongs_to :user
  belongs_to :noteable, polymorphic: true, counter_cache: true

  validates :body, presence: true
  validates :noteable_type, inclusion: { in: NOTEABLE_TYPES }

  scope :for_project_meetings, -> { where(noteable_type: ProjectMeeting.name) }

  after_commit :reindex_noteable

  private

  def reindex_noteable
    noteable&.reindex if noteable.respond_to?(:reindex)
  end
end
