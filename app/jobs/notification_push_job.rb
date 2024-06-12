class NotificationPushJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_executing, queue: :websocket

  def perform(notification_user_hash)
    NotificationService.publish_to_user_feeds(notification_user_hash)
  end
end
