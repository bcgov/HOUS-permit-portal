class Api::UsersController < Api::ApplicationController
  def invite
    user =
      User.invite!(invite_params) do |u|
        u.role = current_user.determine_role_for_invited_user
        u.username = invite_params[:email]
      end
  end

  private

  def invite_params
    params.require(:user).permit(:email) # Add other params as needed
  end
end
