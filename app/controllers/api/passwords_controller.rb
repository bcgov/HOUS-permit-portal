# frozen_string_literal: true

class Api::PasswordsController < Devise::PasswordsController
  include BaseControllerMethods
  respond_to :json

  # POST /resource/password
  def create
    self.resource = User.find_by_username(resource_params[:username])
    if self.resource
      self.resource.send_reset_password_instructions
      if successfully_sent?(resource)
        render json: {}, status: :ok and return
      else
        # TODO: messaging
        render json: {}, status: 400 and return
      end
    end
  end

  # PUT /resource/password
  def update
    super do |resource|
      if resource.errors.empty?
        resource.unlock_access! if unlockable?(resource)
        if Devise.sign_in_after_reset_password
          resource.after_database_authentication
          sign_in(resource_name, resource, store: false)
        else
          set_flash_message!(:notice, :updated_not_active)
        end
        render_success(
          {},
          nil,
          {
            # HACK: pass redirect_url so frontend can redirect with a flash message
            meta: {
              # TODO: messaging
              # redirect_url: root_url(frontend_flash_message("devise.passwords.updated", "success", subdomain: "app")),
              redirect_url: root_url,
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
