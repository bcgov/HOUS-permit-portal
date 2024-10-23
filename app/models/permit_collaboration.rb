class PermitCollaboration < ApplicationRecord
  belongs_to :collaborator
  belongs_to :permit_application

  enum collaboration_type: { submission: 0, review: 1 }
  enum collaborator_type: { delegatee: 0, assignee: 1 }, _default: 0

  before_validation :set_default_collaboration_type, on: :create

  after_initialize :set_default_collaboration_type
  after_save :reindex_permit_application
  after_destroy :send_unassignment_notification

  validates :permit_application_id,
            uniqueness: {
              scope: %i[
                collaborator_id
                collaboration_type
                collaborator_type
                assigned_requirement_block_id
              ]
            }
  validates :collaboration_type, presence: true
  validates :collaborator_type, presence: true
  validates :assigned_requirement_block_id, presence: true, if: -> { assignee? }

  validate :validate_delegatee, on: :create
  validate :validate_requirement_block_id, on: :create # only needs to validate on create as the requirement block can be deleted after assignment due to new template versions
  validate :validate_author_not_collaborator
  validate :validate_review_collaborator
  validate :validate_collaboration_type, on: :create

  def collaborator_name
    collaborator.user.name
  end

  def inviter_name
    collaborator.collaboratorable&.name
  end

  def assigned_requirement_block_name
    permit_application.template_version.requirement_blocks_json.dig(
      assigned_requirement_block_id,
      "name"
    ) || ""
  end

  def collaboration_assignment_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        (
          if submission?
            Constants::NotificationActionTypes::SUBMISSION_COLLABORATION_ASSIGNMENT
          else
            Constants::NotificationActionTypes::REVIEW_COLLABORATION_ASSIGNMENT
          end
        ),
      "action_text" =>
        (
          if delegatee?
            if submission?
              I18n.t(
                "notification.permit_collaboration.submission_delegatee_collaboration_notification",
                number: permit_application.number,
                author_name: permit_application.submitter.name
              )
            else
              I18n.t(
                "notification.permit_collaboration.review_delegatee_collaboration_notification",
                number: permit_application.number
              )
            end
          else
            if submission?
              I18n.t(
                "notification.permit_collaboration.submission_assignee_collaboration_notification",
                number: permit_application.number,
                requirement_block_name: assigned_requirement_block_name,
                author_name: permit_application.submitter.name
              )
            else
              I18n.t(
                "notification.permit_collaboration.review_assignee_collaboration_notification",
                number: permit_application.number,
                requirement_block_name: assigned_requirement_block_name
              )
            end
          end
        ),
      "object_data" => {
        "permit_application_id" => permit_application.id,
        "collaborator_type" => collaborator_type,
        "assigned_requirement_block_name" => assigned_requirement_block_name
      }
    }
  end

  def collaboration_unassignment_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        (
          if submission?
            Constants::NotificationActionTypes::SUBMISSION_COLLABORATION_UNASSIGNMENT
          else
            Constants::NotificationActionTypes::REVIEW_COLLABORATION_UNASSIGNMENT
          end
        ),
      "action_text" =>
        (
          if delegatee?
            I18n.t(
              "notification.permit_collaboration.#{collaboration_type.to_s}_delegatee_collaboration_unassignment_notification",
              number: permit_application.number
            )
          else
            I18n.t(
              "notification.permit_collaboration.#{collaboration_type.to_s}_assignee_collaboration_unassignment_notification",
              number: permit_application.number,
              requirement_block_name: assigned_requirement_block_name
            )
          end
        ),
      "object_data" => {
        "permit_application_id" => permit_application.id,
        "collaborator_type" => collaborator_type,
        "assigned_requirement_block_name" => assigned_requirement_block_name
      }
    }
  end

  def assigned_block_exists?
    # This can be nil if a new template version was published and the requirement block was deleted
    permit_application.template_version.requirement_blocks_json&.key?(
      assigned_requirement_block_id
    )
  end

  private

  def reindex_permit_application
    permit_application.reindex if saved_change_to_collaborator_id?
  end

  def validate_author_not_collaborator
    return unless submission?

    if collaborator.user == permit_application.submitter
      errors.add(:collaborator, :cannot_be_author)
    end
  end

  def validate_collaboration_type
    if submission?
      unless permit_application.draft?
        errors.add(:base, :must_be_draft_for_submission)
      end
    elsif review?
      unless permit_application.submitted?
        errors.add(:base, :must_be_submitted_for_review)
      end
    end
  end

  def validate_review_collaborator
    return unless review?

    unless collaborator
             .user
             .jurisdictions
             .find_by(id: permit_application.jurisdiction_id)
             .present?
      errors.add(:collaborator, :must_be_same_jurisdiction)
    end
  end

  def validate_requirement_block_id
    return unless assignee?

    requirement_blocks_json =
      permit_application.template_version.requirement_blocks_json || {}

    return if requirement_blocks_json.key?(assigned_requirement_block_id)

    errors.add(:assigned_requirement_block_id, :does_not_exist)
  end

  def validate_delegatee
    return unless delegatee?
    existing_delegatee =
      permit_application.permit_collaborations.find_by(
        collaborator_id: collaborator_id,
        collaborator_type: collaborator_type
      )

    return unless existing_delegatee.present?

    errors.add(:collaborator_id, :delegatee_already_exists)
  end

  def set_default_collaboration_type
    if collaborator && collaborator.collaboratorable_type == "Jurisdiction"
      self.collaboration_type = :review
    elsif collaborator && collaborator.collaboratorable_type == "User"
      self.collaboration_type = :submission
    end
  end

  def send_unassignment_notification
    unless collaborator
             &.user
             &.preference
             &.enable_in_app_collaboration_notification
      return
    end

    NotificationService.publish_permit_collaboration_unassignment_event(self)
  end
end
