class PermitBlockStatus < ApplicationRecord
  belongs_to :permit_application

  enum status: { draft: 0, in_progress: 1, ready: 2 }, _default: 0
  enum collaboration_type: { submission: 0, review: 1 }, _default: 0

  validates :requirement_block_id, presence: true
  validates :collaboration_type, presence: true
  validates :permit_application_id,
            uniqueness: {
              scope: %i[requirement_block_id collaboration_type]
            }

  after_commit :send_status_change_websocket
  after_commit :send_status_ready_email
  after_commit :send_status_ready_notification

  attr_accessor :set_by_user

  def requirement_block_name
    permit_application.template_version.requirement_blocks_json.dig(
      requirement_block_id,
      "name"
    )
  end

  def status_ready_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" =>
        Constants::NotificationActionTypes::PERMIT_BLOCK_STATUS_READY,
      "action_text" =>
        (
          if set_by_user.present?
            I18n.t(
              "notification.permit_block_status.status_read_by_user",
              number: permit_application.number,
              requirement_block_name: requirement_block_name || "",
              setter_name: set_by_user.name
            )
          else
            I18n.t(
              "notification.permit_block_status.status_ready_no_user",
              number: permit_application.number,
              requirement_block_name: requirement_block_name || ""
            )
          end
        ),
      "object_data" => {
        "permit_application_id" => permit_application.id,
        "collaboration_type" => collaboration_type,
        "requirement_block_name" => requirement_block_name
      }
    }
  end

  def users_to_notify_status_ready
    users_to_notify = []

    users_to_notify << permit_application.submitter if submission?

    # add delegatee
    users_to_notify +=
      permit_application.users_by_collaboration_options(
        collaboration_type: collaboration_type,
        collaborator_type: :delegatee
      )

    # add only assignees who are assigned to same requirement block

    users_to_notify +=
      permit_application.users_by_collaboration_options(
        collaboration_type: collaboration_type,
        collaborator_type: :assignee,
        assigned_requirement_block_id: requirement_block_id
      )

    users_to_notify.uniq
  end

  def block_exists?
    # This can be nil if a new template version was published and the requirement block was deleted
    permit_application.template_version.requirement_blocks_json&.key?(
      requirement_block_id
    )
  end

  private

  def send_status_change_websocket
    return unless saved_change_to_status?

    user_ids_to_send = users_to_notify_status_ready.pluck(:id)

    if review?
      # as all review staff have access to status we send the status update websocket regardless if they are a collaborator
      user_ids_to_send +=
        permit_application
          .jurisdiction
          .users
          .kept
          .where(role: %i[review_manager reviewer regional_review_manager])
          .pluck(:id)
    end

    WebsocketBroadcaster.push_update_to_relevant_users(
      user_ids_to_send.uniq,
      Constants::Websockets::Events::PermitApplication::DOMAIN,
      Constants::Websockets::Events::PermitApplication::TYPES[
        :update_permit_block_status
      ],
      PermitBlockStatusBlueprint.render_as_hash(self)
    )
  end

  def send_status_ready_email
    return unless saved_change_to_status? && ready?

    users_to_notify_status_ready.each do |user|
      next unless user.preference&.enable_email_collaboration_notification

      PermitHubMailer.notify_block_status_ready(
        permit_block_status: self,
        user:,
        status_set_by: set_by_user
      )&.deliver_later
    end
  end

  def send_status_ready_notification
    return unless saved_change_to_status? && ready?
    NotificationService.publish_permit_block_status_ready_event(self)
  end
end
