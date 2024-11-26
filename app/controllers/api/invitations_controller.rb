class Api::InvitationsController < Devise::InvitationsController
  include BaseControllerMethods
  respond_to :json
  before_action :authenticate_user!
  before_action :find_invited_user, only: %i[show]
  skip_before_action :authenticate_user!, only: %i[show]

  def create
    inviter =
      Jurisdiction::UserInviter.new(
        inviter: current_user,
        users_params: users_params
      ).call
    if (
         inviter.results[:invited] + inviter.results[:reinvited] +
           inviter.results[:email_taken]
       ).any?
      render_success(inviter.results, nil, { blueprint: InvitationBlueprint })
    else
      render_error "user.create_invite_error" and return
    end
  end

  def show
    if @invited_user
      render_success @invited_user,
                     nil,
                     {
                       blueprint: UserBlueprint,
                       blueprint_opts: {
                         view: :invited_user
                       }
                     }
    else
      render json: { error: :invalid_token }, status: :not_found
    end
  end

  private

  def users_params
    params
      .require(:users)
      .map do |user_param|
        user_param.permit(
          :email,
          :role,
          :first_name,
          :last_name,
          :jurisdiction_id
        )
      end
  end

  def user_params
    params.require(:user).permit(:first_name, :last_name)
  end

  def render_accept_invite_error(resource)
    render_error "user.accept_invite_error",
                 {
                   message_opts: {
                     error_message: resource.errors.full_messages.join(", ")
                   }
                 }
  end

  def find_invited_user
    @invited_user =
      User.find_by_invitation_token(params[:invitation_token], true)
  end
end
