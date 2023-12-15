class Api::InvitationsController < Devise::InvitationsController
  include BaseControllerMethods
  respond_to :json
  before_action :authenticate_user!
  before_action :find_invited_user, only: %i[remove resend]

  def create
    inviter = Jurisdiction::UserInviter.new(inviter: current_user, users_params: users_params).call

    render_success(inviter.results, nil, { blueprint: InvitationBlueprint })
  end

  def remove
    render_success(@user, "user.invitation_removed_success") if @user.destroy
  end

  def update
    raw_invitation_token = update_resource_params["invitation_token"]
    self.resource = accept_resource
    invitation_accepted = resource.errors.empty?

    yield resource if block_given?

    resource.update(user_params)
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
    render_success({}, "user.send_invitation_success") if @user.invite!
  end

  def remove
    render_success(@user, "user.invitation_removed_success") if @user.destroy
  end

  private

  def users_params
    params
      .require(:users)
      .map { |user_param| user_param.permit(:first_name, :last_name, :email, :role, :jurisdiction_id) }
  end

  def user_params
    params.require(:user).permit(:username, :password)
  end
end
