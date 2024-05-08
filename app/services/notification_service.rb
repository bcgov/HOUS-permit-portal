class NotificationService
  NEW_TEMPLATE_VERSION_PUBLISH_EVENT = "new_template_version_publish"

  def self.reset_user_feed_last_read(user_id)
    mf = SimpleFeed.user_feed.activity(user_id)
    mf.reset_last_read
  end

  def self.total_page_count(total_count)
    (total_count.to_f / (ENV["NOTIFICATION_FEED_PER_PAGE"] || 5).to_f || 5).ceil
  end

  def self.user_feed_for(user_id, page)
    uf = SimpleFeed.user_feed.activity(user_id)

    user_feed_items = uf.paginate(page: page.to_i || 1, reset_last_read: false)

    {
      feed_items:
        user_feed_items.map { |f| OpenStruct.new(JSON.parse(f.value, symbolize_names: true).merge({ at: f.at })) },
      total_pages: total_page_count(uf.total_count),
      feed_object: uf,
    }
  end

  def self.publish_to_user_feeds(event, notification_data, user_ids_to_publish_to)
    notification_data["id"] = SecureRandom.uuid
    activity = SimpleFeed.user_feed.activity(user_ids_to_publish_to)

    # send this to the redis store
    activity.store(event: SimpleFeed::Event.new(notification_data.to_json, Time.now))

    # push to specific users
    # we need to calculate page metadata for each user individually
    payloads = {}
    user_ids_to_publish_to.each do |user_id|
      payloads[user_id] = {
        domain: "notification",
        event_type: event,
        data: notification_data,
        meta: {
          total_pages:
            total_page_count(
              # The result type may be a number or a hash of numbers depending on the number of users being notified
              activity_metadata(user_id, activity, :total_count),
            ),
          unread_count: activity_metadata(user_id, activity, :unread_count),
          last_read_at: activity_metadata(user_id, activity, :last_read),
        },
      }
    end
    WebsocketBroadcaster.push_user_payloads(payloads)
  end

  def self.publish_new_template_version_publish_event(template_version)
    NotificationPushJob.perform_async(
      NEW_TEMPLATE_VERSION_PUBLISH_EVENT,
      template_version.publish_event_notification_data, # TODO
      User.review_managers.pluck(:id),
    )
  end

  private

  # this is just a wrapper around the activity's metadat methods
  # since in the case of a single instance it returns a specific return type (eg. Integer)
  # but in the case of multiple user_ids the activity is a hash object
  def self.activity_metadata(user_id, activity_obj, method)
    metadata = activity_obj.send(method).result
    metadata.is_a?(Hash) ? metadata[user_id] : metadata
  end
end
