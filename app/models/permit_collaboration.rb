class PermitCollaboration < ApplicationRecord
  include Discard::Model

  # discard is an update (sets discarded_at), so we need :update for unassign to be audited
  audited on: %i[create update], associated_with: :permit_application

  belongs_to :collaborator
  belongs_to :permit_application, touch: true

  enum :collaborator_type, { delegatee: 0, assignee: 1 }, default: 0

  after_save :reindex_permit_application
  after_commit :reindex_permit_project
  after_discard do
    send_unassignment_notification
    reindex_permit_application
  end

  validates :permit_application_id,
            uniqueness: {
              scope: %i[
                collaborator_id
                collaborator_type
                assigned_requirement_block_id
              ],
              conditions: -> { where(discarded_at: nil) }
            }
  validates :collaborator_type, presence: true
  validates :assigned_requirement_block_id, presence: true, if: -> { assignee? }

  validate :validate_delegatee, on: :create
  validate :validate_requirement_block_id, on: :create # only needs to validate on create as the requirement block can be deleted after assignment due to new template versions
  validate :validate_review_collaborator
  validate :validate_submitted_for_review, on: :create

  def collaborator_name
    collaborator.user.name
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
        Constants::NotificationActionTypes::REVIEW_COLLABORATION_ASSIGNMENT,
      "action_text" =>
        (
          if delegatee?
            I18n.t(
              "notification.permit_collaboration.review_delegatee_collaboration_notification",
              number: permit_application.number
            )
          else
            I18n.t(
              "notification.permit_collaboration.review_assignee_collaboration_notification",
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

  def collaboration_unassignment_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::REVIEW_COLLABORATION_UNASSIGNMENT,
      "action_text" =>
        (
          if delegatee?
            I18n.t(
              "notification.permit_collaboration.review_delegatee_collaboration_unassignment_notification",
              number: permit_application.number
            )
          else
            I18n.t(
              "notification.permit_collaboration.review_assignee_collaboration_unassignment_notification",
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
    permit_application&.reindex
  end

  def reindex_permit_project
    permit_application.permit_project&.reindex
  end

  def validate_submitted_for_review
    return if permit_application.blank?
    return if permit_application.submitted_at_least_once?

    errors.add(:base, :must_be_submitted_for_review)
  end

  def validate_review_collaborator
    return if collaborator.blank? || permit_application.blank?

    same_jurisdiction =
      collaborator.jurisdiction_id == permit_application.jurisdiction_id &&
        collaborator
          .user
          .jurisdictions
          .find_by(id: permit_application.jurisdiction_id)
          .present?

    unless same_jurisdiction
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
    return if permit_application.blank? || collaborator_id.blank?

    existing_delegatee =
      permit_application.permit_collaborations.find_by(
        collaborator_id: collaborator_id,
        collaborator_type: collaborator_type
      )

    return unless existing_delegatee.present?

    errors.add(:collaborator_id, :delegatee_already_exists)
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
