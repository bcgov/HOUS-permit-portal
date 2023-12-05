# frozen_string_literal: true

class Api::PasswordsController < Devise::PasswordsController
  include BaseControllerMethods
  respond_to :json

  # POST /resource/password
  def create
    self.resource = User.find_by_username(resource_params[:username])
    if self.resource
      self.resource.send_reset_password_instructions
      render_success({}, "devise.send_paranoid_instructions")
    end
  end

  # PUT /resource/password
  def update
    super do |resource|
      if resource.errors.empty?
        resource.unlock_access! if unlockable?(resource)
        render_success(
          {},
          nil,
          {
            # HACK: pass redirect_url so frontend can redirect with a flash message
            meta: {
              redirect_url: login_url(frontend_flash_message("devise.password_updated", "success")),
            },
          },
        ) and return
      else
        set_minimum_password_length
        respond_with resource and return
      end
    end
  end

  protected

  def resource_params
    params.require(:user).permit(:username, :reset_password_token, :password)
  end
end
