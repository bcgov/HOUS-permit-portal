class UserChannel < ApplicationCable::Channel
  def subscribed
    stream_from "#{Constants::Websockets::Channels::USER_CHANNEL_PREFIX}-#{current_user.id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    stop_all_streams
  end
end
