class NotificationService
  def self.reset_notification_feed_last_read(user_id)
    mf = SimpleFeed.template_update_feed.activity(user_id)
    mf.reset_last_read
  end

  def self.template_update_feed_for(user_id)
    nf = SimpleFeed.template_update_feed.activity(user_id)
    notification_feed_items = nf.fetch(reset_last_read: false)

    {
      feed_items:
        notification_feed_items.map do |f|
          OpenStruct.new(JSON.parse(f.value, symbolize_names: true).merge({ at: f.at }))
        end,
      feed_object: nf,
    }
  end

  def self.publish_to_template_update_feed(requirement_template)
    # TODO: determine which users to update
    # user_ids = requirement_template.user_ids_to_notify
    # activity = SimpleFeed.template_update_feed.activity(user_ids)

    # TODO: Define how to serialize a requirement template for the notificaiton
    # requirement_template_json = requirement_template.as_json

    # TODO: define notification data
    # notification = {
    #   id: SecureRandom.uuid,
    #   action: "TODO: Text for template update",
    #   TODO: requirement_template data to include
    #   requirement_template: requirement_template_json
    # }

    #TODO: Camelize requirement template data
    # requirement_template_json_camelized =
    # requirement_template_json.transform_keys do |key|
    #   key.to_s.underscore.camelize(:lower)
    # end

    # send this to the redis store
    activity.store(event: SimpleFeed::Event.new(notification.to_json, Time.now))

    camelized_hash = notification.transform_keys { |key| key.to_s.underscore.camelize(:lower) }

    camelized_hash["requirementTemplate"] = requirement_template_json_camelized

    WebsocketBroadcaster.push_notification(user_ids, { **camelized_hash, "at" => Time.now })
  end

  private
end
