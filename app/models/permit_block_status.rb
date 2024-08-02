class PermitBlockStatus < ApplicationRecord
  belongs_to :permit_application

  enum status: { draft: 0, in_progress: 1, ready: 2 }, _default: 0
  enum collaboration_type: { submission: 0, review: 1 }, _default: 0

  validates :requirement_block_id, presence: true
  validates :collaboration_type, presence: true
  validates :permit_application_id, uniqueness: { scope: %i[requirement_block_id collaboration_type] }
end
