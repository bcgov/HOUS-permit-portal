class PermitBlockStatus < ApplicationRecord
  belongs_to :permit_application

  enum status: { draft: 0, in_progress: 1, ready: 2 }, _default: 0
  enum collaboration_type: { submission: 0, review: 1 }, _default: 0

  validates :requirement_block_id, presence: true
  validates :collaboration_type, presence: true
  validates :permit_application_id, uniqueness: { scope: %i[requirement_block_id collaboration_type] }

  after_commit :send_status_change_websocket
  after_commit :send_status_ready_email

  attr_accessor :set_by_user

  def requirement_block_name
    permit_application.template_version.requirement_blocks_json.dig(requirement_block_id, "name")
  end

  private

  def notification_users
  end

  def send_status_change_websocket
    return unless saved_change_to_status?

    user_ids_to_send = users_to_notify_status_ready.pluck(:id)

    if submission?
      user_ids_to_send +=
        permit_application.users_by_collaboration_options(
          collaboration_type: :submission,
          collaborator_type: :assignee,
        ).pluck(:id)
    end

    WebsocketBroadcaster.push_update_to_relevant_users(
      user_ids_to_send.uniq,
      Constants::Websockets::Events::PermitApplication::DOMAIN,
      Constants::Websockets::Events::PermitApplication::TYPES[:update_permit_block_status],
      PermitBlockStatusBlueprint.render_as_hash(self),
    )
  end

  def users_to_notify_status_ready
    users_to_notify = []

    if submission?
      users_to_notify << permit_application.submitter
      users_to_notify +=
        permit_application.users_by_collaboration_options(
          collaboration_type: :submission,
          collaborator_type: :delegatee,
        )
    else
      users_to_notify +=
        permit_application.jurisdiction.users.kept.where(role: %i[review_manager reviewer regional_review_manager])
    end

    users_to_notify.uniq
  end

  def send_status_ready_email
    return unless saved_change_to_status? && ready?

    users_to_notify_status_ready.each do |user|
      PermitHubMailer.notify_block_status_ready(
        permit_block_status: self,
        user:,
        status_set_by: set_by_user,
      ).deliver_later
    end
  end
end
