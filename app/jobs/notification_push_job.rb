class NotificationPushJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_executing, queue: :websocket

  def perform(notification_data, user_ids_to_publish_to)
    NotificationService.publish_to_user_feeds(notification_data, user_ids_to_publish_to)
  end
end
