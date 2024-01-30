class Api::InvitationsController < Devise::InvitationsController
  include BaseControllerMethods
  respond_to :json
  before_action :authenticate_user!
  before_action :find_invited_user, only: %i[remove resend]

  def create
    inviter = Jurisdiction::UserInviter.new(inviter: current_user, users_params: users_params).call
    if inviter.results[:invited].any?
      render_success(inviter.results, nil, { blueprint: InvitationBlueprint })
    else
      render_error Constants::Error::USER_CREATE_INVITE_ERROR, "user.create_invite_error", nil and return
    end
  end

  def remove
    render_success(@user, "user.invitation_removed_success") if @user.destroy
  end

  def update
    raw_invitation_token = update_resource_params["invitation_token"]
    user = User.find_by_invitation_token(raw_invitation_token, true)
    user.update(user_params)

    self.resource = accept_resource if user&.errors.empty?
    invitation_accepted = resource.errors.empty?

    yield resource if block_given?

    if invitation_accepted
      resource.after_database_authentication

      # TODO: Onboarding after invitation?
      # resource.onboard!
      sign_in(resource_name, resource)

      render_success(
        {},
        nil,
        { meta: { redirect_url: root_url(frontend_flash_message("user.invitation_accepted_success", "success")) } },
      ) and return
    else
      resource.invitation_token = raw_invitation_token
      # resource.errors.full_messages is full here probably with "Invitation token is invalid", lets just craft our own message for now
      render_error Constants::Error::USER_ACCEPT_INVITE_ERROR,
                   "user.accept_invite_error",
                   message_opts: {
                     error_message: resource.errors.full_messages.join(", "),
                   } and return
    end
  end

  def resend
    if @user.invite!
      render_success({}, "user.send_invitation_success")
    else
      render_error Constants::Error::USER_RESEND_INVITE_ERROR, "user.resend_invite_error", nil and return
    end
  end

  def remove
    if @user.destroy
      render_success(@user, "user.invitation_removed_success")
    else
      render_error Constants::Error::USER_REMOVE_INVITE_ERROR, "user.remove_invite_error", nil and return
    end
  end

  private

  def users_params
    params
      .require(:users)
      .map { |user_param| user_param.permit(:email, :role, :jurisdiction_id, :first_name, :last_name) }
  end

  def user_params
    params.require(:user).permit(:username, :password, :first_name, :last_name)
  end
end
