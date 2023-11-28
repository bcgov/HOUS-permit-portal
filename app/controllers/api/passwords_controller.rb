# frozen_string_literal: true

class Api::PasswordsController < Devise::PasswordsController
  include BaseControllerMethods
  respond_to :json

  # GET /resource/password/new
  # def new
  #   super
  # end

  # POST /resource/password
  def create
    # self.resource = resource_class.send_reset_password_instructions(resource_params)
    # yield resource if block_given?

    super { |resource| render json: {}, status: :ok and return }
    # TODO: messaging
    # super { |resource| render_success({}, 'devise.passwords.send_instructions') and return }
  end

  # GET /resource/password/edit?reset_password_token=abcdef
  # def edit
  #   super
  # end

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

  # def resource_params
  #   params.require(resource_name).permit(:username)
  # end

  # def after_resetting_password_path_for(resource)
  #   super(resource)
  # end

  # The path used after sending reset password instructions
  # def after_sending_reset_password_instructions_path_for(resource_name)
  #   super(resource_name)
  # end
end
