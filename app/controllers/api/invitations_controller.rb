class Api::InvitationsController < Devise::InvitationsController
  include BaseControllerMethods
  respond_to :json
  before_action :authenticate_user!
  before_action :find_invited_user, only: %i[show]
  skip_before_action :authenticate_user!, only: %i[show]

  def create
    inviter = Jurisdiction::UserInviter.new(inviter: current_user, users_params: users_params).call
    if (inviter.results[:invited] + inviter.results[:reinvited] + inviter.results[:email_taken]).any?
      render_success(inviter.results, nil, { blueprint: InvitationBlueprint })
    else
      render_error "user.create_invite_error" and return
    end
  end

  def show
    if @invited_user
      render_success @invited_user, nil, { blueprint: UserBlueprint, blueprint_opts: { view: :invited_user } }
    else
      render json: { error: :invalid_token }, status: :not_found
    end
  end

  def update
    raw_invitation_token = update_resource_params["invitation_token"]
    user = User.find_by_invitation_token(raw_invitation_token, true)

    render_error "user.invalid_invitation_error" and return unless user.present?
    render_accept_invite_error(user) and return unless user.update(user_params)

    self.resource = accept_resource
    invitation_accepted = resource&.errors&.empty?

    yield resource if block_given?

    if invitation_accepted
      resource.after_database_authentication

      PermitHubMailer.onboarding(user).deliver_later
      sign_in(resource_name, resource)

      render_success(
        {},
        nil,
        { meta: { redirect_url: root_url(frontend_flash_message("user.invitation_accepted_success", "success")) } },
      ) and return
    else
      resource.invitation_token = raw_invitation_token
      render_accept_invite_error(resource) and return
    end
  end

  private

  def users_params
    params
      .require(:users)
      .map { |user_param| user_param.permit(:email, :role, :first_name, :last_name, :jurisdiction_id) }
  end

  def user_params
    params.require(:user).permit(:nickname, :first_name, :last_name)
  end

  def render_accept_invite_error(resource)
    render_error "user.accept_invite_error",
                 { message_opts: { error_message: resource.errors.full_messages.join(", ") } }
  end

  def find_invited_user
    @invited_user = User.find_by_invitation_token(params[:invitation_token], true)
  end
end
