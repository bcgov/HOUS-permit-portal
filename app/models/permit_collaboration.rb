class PermitCollaboration < ApplicationRecord
  belongs_to :collaborator
  belongs_to :permit_application

  enum collaboration_type: { submission: 0, review: 1 }
  enum collaborator_type: { delegatee: 0, assignee: 1 }, _default: 0

  before_validation :set_default_collaboration_type, on: :create

  validates :permit_application_id,
            uniqueness: {
              scope: %i[collaborator_id collaboration_type collaborator_type assigned_requirement_block_id],
            }
  validates :collaboration_type, presence: true
  validates :collaborator_type, presence: true
  validates :assigned_requirement_block_id, presence: true, if: -> { assignee? }

  validate :validate_delegatee, on: :create
  validate :validate_requirement_block_id, on: :create # only needs to validate on create as the requirement block can be deleted after assignment due to new template versions
  validate :validate_author_not_collaborator
  validate :validate_review_collaborator

  private

  def validate_author_not_collaborator
    return unless submission?

    errors.add(:collaborator, :cannot_be_author) if collaborator.user == permit_application.submitter
  end

  def validate_review_collaborator
    return unless review?

    unless collaborator.user.jurisdictions.find_by(id: permit_application.jurisdiction_id).present?
      errors.add(:collaborator, :must_be_same_jurisdiction)
    end
  end

  def validate_requirement_block_id
    return unless assignee?

    requirement_blocks_json = permit_application.template_version.requirement_blocks_json || {}

    return if requirement_blocks_json.key?(assigned_requirement_block_id)

    errors.add(:assigned_requirement_block_id, :does_not_exist)
  end

  def validate_delegatee
    return unless delegatee?
    existing_delegatee =
      permit_application.permit_collaborations.find_by(
        collaborator_id: collaborator_id,
        collaborator_type: collaborator_type,
      )

    return unless existing_delegatee.present?

    errors.add(:collaborator_id, :delegatee_already_exists)
  end

  def set_default_collaboration_type
    return unless collaborator.present?

    if collaborator && collaborator.collaboratorable_type == "Jurisdiction"
      self.collaboration_type ||= :review
    elsif collaborator && collaborator.collaboratorable_type == "User"
      self.collaboration_type ||= :submission
    end
  end
end
