class WebsocketBroadcaster
  # Current data is passed via the CurrentAttributes on AcitveSupport
  def self.user_channel(user_id)
    "#{Constants::Channels::USER_CHANNEL_PREFIX}-#{user_id}"
  end

  def self.broadcast_ready?
    Current.skip_websocket_broadcasts.blank?
  end

  def self.push_notification(hash)
    return unless broadcast_ready?
    ActionCable.server.broadcast(user_channel(Current.user.id), hash)
  end

  def self.push_user_payloads(payloads_hash)
    return unless Current.skip_websocket_broadcasts.blank? || payloads_hash.blank?

    payloads_hash.each { |user_id, payload| ActionCable.server.broadcast(user_channel(user_id), payload) }
  end

  def self.push_update_to_relevant_users(user_ids, domain, eventType, data)
    user_ids.each do |id|
      ActionCable.server.broadcast(user_channel(id), { domain: domain, eventType: eventType, data: data })
    end
  end
end
