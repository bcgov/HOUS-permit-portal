module Constants
  # For use with render_error base controller method
  # Used for the purpose of logging / debugging (not user facing)
  module Error
    def self.e(code, message)
      { code: code, message: message }
    end

    USER_REGISTRATION_ERROR = e("user_registration_error", "Error registering user")
    USER_LOGIN_ERROR = e("invalid_login_error", "Invalid username or password")
    INVALID_TOKEN_ERROR = e("invalid_token_error", "The access token is invalid")
  end
end
