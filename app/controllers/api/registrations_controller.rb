# frozen_string_literal: true

class Api::RegistrationsController < Devise::RegistrationsController
  include BaseControllerMethods

  respond_to :json
  prepend_before_action :allow_params_authentication!, only: :create
  before_action :configure_permitted_params, only: :create

  def create
    super do |resource|
      if resource.persisted?
        if resource.active_for_authentication?
          render_success resource and return
        else
          expire_data_after_sign_in!
          respond_with resource, location: after_inactive_sign_up_path_for(resource) and return
        end
      else
        clean_up_passwords resource
        set_minimum_password_length
        render_error Constants::Error::USER_REGISTRATION_ERROR,
                     "user.registration_error",
                     message_opts: {
                       error_message: resource.errors.full_messages.join(", "),
                     } and return
      end
    end
  end

  private

  def configure_permitted_params
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[username email password organization certified])
  end
end
