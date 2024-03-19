class Api::UsersController < Api::ApplicationController
  before_action :find_user, only: %i[destroy restore accept_eula]

  def index
    perform_search

    render_success @search.results,
                   nil,
                   {
                     meta: {
                       total_pages: @search.total_pages,
                       total_count: @search.total_count,
                       current_page: @search.current_page,
                     },
                     blueprint: UserBlueprint,
                   }
  end

  def update
    # Currently a user can only update themself
    @user = current_user
    authorize @user

    ActiveRecord::Base.transaction do
      if password_params[:password].present?
        if @user.update_with_password(password_params)
          Devise::Mailer.new.password_change(@user).deliver
        else
          raise ActiveRecord::RecordInvalid
        end
      end

      raise ActiveRecord::RecordInvalid unless @user.update(user_params)
    end

    render_success(@user, email_changed? ? "user.confirmation_sent" : "user.update_success")
  rescue ActiveRecord::RecordInvalid => e
    # Handle any ActiveRecord exceptions here
    if password_params[:password].present? && !@user.valid_password?(password_params[:current_password])
      render_error "user.update_password_error", {}, e and return
    end
    render_error "user.update_error", {}, e
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
    @user.license_agreements.create!(accepted_at: Time.current, agreement: EndUserLicenseAgreement.active_agreement)
    render_success @user, "user.eula_accepted", { blueprint_opts: { view: :current_user } }
  end

  private

  def email_changed?
    user_params[:email] && user_params[:email] != @user.email
  end

  def password_params
    params.require(:user).permit(:current_password, :password)
  end

  def find_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:email, :first_name, :last_name, :organization, :certified)
  end
end
