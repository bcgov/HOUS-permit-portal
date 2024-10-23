class WebsocketBroadcaster
  # Current data is passed via the CurrentAttributes on AcitveSupport
  def self.user_channel(user_id)
    "#{Constants::Websockets::Channels::USER_CHANNEL_PREFIX}-#{user_id}"
  end

  def self.broadcast_ready?
    Current.skip_websocket_broadcasts.blank?
  end

  def self.push_notification(hash)
    return unless broadcast_ready?
    ActionCable.server.broadcast(user_channel(Current.user.id), hash)
  end

  def self.push_user_payloads(payloads_hash)
    unless Current.skip_websocket_broadcasts.blank? || payloads_hash.blank?
      return
    end

    payloads_hash.each do |user_id, payload|
      ActionCable.server.broadcast(user_channel(user_id), payload)
    end
  end

  def self.push_update_to_relevant_users(user_ids, domain, eventType, data)
    user_ids.each do |id|
      ActionCable.server.broadcast(
        user_channel(id),
        { domain: domain, eventType: eventType, data: data }
      )
    end
  end
end
