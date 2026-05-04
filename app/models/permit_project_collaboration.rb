class PermitProjectCollaboration < ApplicationRecord
  include Discard::Model

  belongs_to :permit_project, touch: true
  belongs_to :collaborator

  after_save :reindex_permit_project
  after_discard do
    send_unassignment_notification
    reindex_permit_project
  end

  validates :permit_project_id,
            uniqueness: {
              scope: :collaborator_id,
              conditions: -> { where(discarded_at: nil) },
              message: :already_assigned
            }

  validate :validate_review_staff_for_jurisdiction
  validate :validate_collaborator_is_review_type
  validate :validate_only_one_kept_per_project

  def collaboration_assignment_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::PROJECT_REVIEW_COLLABORATION_ASSIGNMENT,
      "action_text" =>
        I18n.t(
          "notification.permit_project_collaboration.assignment_notification",
          project_number: permit_project.number
        ),
      "object_data" => {
        "permit_project_id" => permit_project.id,
        "project_number" => permit_project.number,
        "jurisdiction_slug" => permit_project.jurisdiction&.slug
      }
    }
  end

  def collaboration_unassignment_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::PROJECT_REVIEW_COLLABORATION_UNASSIGNMENT,
      "action_text" =>
        I18n.t(
          "notification.permit_project_collaboration.unassignment_notification",
          project_number: permit_project.number
        ),
      "object_data" => {
        "permit_project_id" => permit_project.id,
        "project_number" => permit_project.number,
        "jurisdiction_slug" => permit_project.jurisdiction&.slug
      }
    }
  end

  private

  def reindex_permit_project
    permit_project&.reindex
  end

  def validate_review_staff_for_jurisdiction
    return if collaborator.blank? || permit_project.blank?

    unless collaborator.user.review_staff_of?(permit_project.jurisdiction_id)
      errors.add(:collaborator, :must_be_review_staff_for_jurisdiction)
    end
  end

  def validate_collaborator_is_review_type
    return if collaborator.blank?

    unless collaborator.collaboratorable_type == "Jurisdiction"
      errors.add(:collaborator, :must_be_review_collaborator)
    end
  end

  def validate_only_one_kept_per_project
    return unless permit_project_id
    return if discarded?

    scope = self.class.kept.where(permit_project_id: permit_project_id)
    scope = scope.where.not(id: id) if persisted?
    return unless scope.exists?

    errors.add(:permit_project, :only_one_review_collaborator_allowed)
  end

  def send_unassignment_notification
    unless collaborator
             &.user
             &.preference
             &.enable_in_app_collaboration_notification
      return
    end

    NotificationService.publish_project_collaboration_unassignment_event(self)
  end
end
