module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # decode using JWT strategy
      decoder = Warden::JWTAuth::UserDecoder.new
      verified_user = decoder.call(cookies["access_token"], :user, nil)
      verified_user.blank? ? reject_unauthorized_connection : verified_user
    end
  end
end
