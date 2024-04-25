class Api::UsersController < Api::ApplicationController
  include Api::Concerns::Search::AdminUsers

  before_action :find_user, only: %i[destroy restore accept_eula update]
  skip_after_action :verify_policy_scoped, only: %i[index]
  skip_before_action :require_confirmation, only: %i[profile]

  def index
    authorize :user, :index?
    perform_user_search
    authorized_results =
      apply_search_authorization(@user_search.results, "search_admin_users")

    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @user_search.total_pages,
                       total_count: @user_search.total_count,
                       current_page: @user_search.current_page
                     },
                     blueprint: UserBlueprint
                   }
  end

  def update
    authorize @user
    unless %w[reviewer review_manager].include?(user_params[:role])
      return render_error "misc.user_not_authorized_error"
    end

    if @user.update(user_params)
      render_success @user, "user.update_success"
    else
      render_error "user.update_error"
    end
  end

  def profile
    # Currently a user can only update themself
    @user = current_user
    authorize current_user

    if current_user.update(profile_params)
      current_user.send_confirmation_instructions if @user.confirmed_at.blank?
      render_success(
        current_user,
        (
          if email_changed? || @user.confirmed_at.blank?
            "user.confirmation_sent"
          else
            "user.update_success"
          end
        )
      )
    else
      render_error "user.update_error",
                   {
                     message_opts: {
                       error_message:
                         current_user.errors.full_messages.join(", ")
                     }
                   }
    end
  end

  def destroy
    authorize @user
    if @user.discard
      render_success(@user, "user.destroy_success")
    else
      render_error "user.destroy_error", {}
    end
  end

  def restore
    authorize @user
    if @user.update(discarded_at: nil)
      render_success(@user, "user.restore_success")
    else
      render_error "user.restore_error", {}
    end
  end

  def accept_eula
    authorize @user
    @user.license_agreements.create!(
      accepted_at: Time.current,
      agreement: EndUserLicenseAgreement.active_agreement(@user.eula_variant)
    )
    render_success @user,
                   "user.eula_accepted",
                   { blueprint_opts: { view: :current_user } }
  end

  private

  def email_changed?
    profile_params[:email] && profile_params[:email] != @user.email
  end

  def password_params
    params.require(:user).permit(:current_password, :password)
  end

  def find_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:role)
  end

  def profile_params
    params.require(:user).permit(
      :email,
      :nickname,
      :first_name,
      :last_name,
      :organization,
      :certified
    )
  end
end
