class PermitBlockStatus < ApplicationRecord
  belongs_to :permit_application

  enum status: { draft: 0, in_progress: 1, ready: 2 }, _default: 0
  enum collaboration_type: { submission: 0, review: 1 }, _default: 0

  validates :requirement_block_id, presence: true
  validates :collaboration_type, presence: true
  validates :permit_application_id, uniqueness: { scope: %i[requirement_block_id collaboration_type] }

  after_commit :send_status_change_websocket

  private

  def send_status_change_websocket
    return unless saved_change_to_status?

    user_ids_to_send = []

    if submission?
      user_ids_to_send << permit_application.submitter_id
      user_ids_to_send += permit_application.users_by_collaboration_options(collaboration_type: :submission).pluck(:id)
    elsif review?
      user_ids_to_send +=
        permit_application
          .jurisdiction
          .users
          .kept
          .where(role: %i[review_manager reviewer regional_review_manager])
          .pluck(:id)
    end

    WebsocketBroadcaster.push_update_to_relevant_users(
      user_ids_to_send,
      Constants::Websockets::Events::PermitApplication::DOMAIN,
      Constants::Websockets::Events::PermitApplication::TYPES[:update_permit_block_status],
      PermitBlockStatusBlueprint.render_as_hash(self),
    )
  end
end
