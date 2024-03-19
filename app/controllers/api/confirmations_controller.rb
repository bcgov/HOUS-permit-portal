class Api::ConfirmationsController < Devise::ConfirmationsController
  include BaseControllerMethods
  respond_to :json

  # resend confirmation email
  def resend
    return if params[:email].blank?

    @user = User.find_by_email(params[:email])
    @user.resend_confirmation_instructions if @user.present?
    render_success({}, "user.confirmation_email_sent_success")
  end

  # GET /resource/confirmation?confirmation_token=abcdef
  # use a special redirect with a frontend flash message here
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    if resource.errors.empty?
      PermitHubMailer.welcome(@user).deliver_later
      redirect_to login_url(frontend_flash_message("user.confirmation_success", "success"))
    else
      redirect_to login_url(
                    frontend_flash_message(
                      "user.confirmation_error",
                      "error",
                      message_opts: {
                        error_message: resource.errors.full_messages.join(","),
                      },
                    ),
                  )
    end
  end
end
