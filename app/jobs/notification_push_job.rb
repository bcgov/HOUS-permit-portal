class NotificationPushJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_executing, queue: :websocket

  def perform(event, data, user_ids_to_publish_to)
    NotificationService.publish_to_user_feeds(event, data, user_ids_to_publish_to)
  end
end
