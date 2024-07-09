class PermitCollaboration < ApplicationRecord
  belongs_to :collaborator
  belongs_to :permit_application

  enum collaboration_type: { submission: 0, review: 1 }
  enum collaborator_type: { delegatee: 0, assignee: 1 }, _default: 0

  before_validation :set_default_collaboration_type, on: :create

  validates :permit_application_id, uniqueness: { scope: %i[collaborator_id collaboration_type collaborator_type] }
  validates :collaboration_type, presence: true
  validates :collaborator_type, presence: true

  private

  def set_default_collaboration_type
    return unless collaborator.present?

    if collaborator && collaborator.collaboratorable_type == "Jurisdiction"
      self.collaboration_type ||= :review
    elsif collaborator && collaborator.collaboratorable_type == "User"
      self.collaboration_type ||= :submission
    end
  end
end
