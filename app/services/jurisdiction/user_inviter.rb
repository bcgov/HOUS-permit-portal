class Jurisdiction::UserInviter
  attr_accessor :results
  attr_reader :inviter, :users_params

  def initialize(inviter:, users_params:)
    @inviter = inviter
    @users_params = users_params
    @results = { invited: [], reinvited: [], email_taken: [], failed: [] }
  end

  def call
    invite_users
    self
  end

  def invite_users
    users_params.each do |user_params|
      selected_role = user_params[:role].to_s
      next unless inviter.invitable_roles.include?(selected_role)

      user = find_existing_invited_user(user_params[:email])
      jurisdiction_id =
        user_params.delete(:jurisdiction_id) || inviter.jurisdictions.pluck(:id)
      begin
        if should_promote_to_regional_rm?(user, selected_role, jurisdiction_id)
          promote_to_regional_rm(user, jurisdiction_id)
          results[:invited] << user
        elsif cannot_take_email?(user)
          results[:email_taken] << user
        else
          handle_reinvitation_or_invitation(user, user_params, jurisdiction_id)
        end
      rescue StandardError
        results[:failed] << { email: user_params[:email] }
      end
    end
  end

  private

  def find_existing_invited_user(email)
    # Inviting submitters causes a second user to be created with the same email
    # After accepting the invite, only the non-submitter User remains
    User.where.not(role: :submitter).find_by(email: email.strip)
  end

  def cannot_take_email?(user)
    user.present? && user.confirmed? && !user.discarded?
  end

  def should_promote_to_regional_rm?(user, selected_role, jurisdiction_id)
    selected_role.to_sym == :regional_review_manager && user.present? &&
      !user.discarded? && user.promotable_to_regional_rm? &&
      jurisdiction_id.present?
  end

  def promote_to_regional_rm(user, jurisdiction_id)
    # May already be RRM, in which case this method just adds new jurisdiction memberships
    user.update(role: :regional_review_manager)

    membership =
      user
        .jurisdiction_memberships
        .find_or_create_by(jurisdiction_id: jurisdiction_id) do |_|
          if user.confirmed?
            PermitHubMailer.new_jurisdiction_membership(
              user,
              jurisdiction_id
            ).deliver_later
          end
        end

    membership.touch
    user.invite!(inviter) unless user.confirmed?
  end

  def handle_reinvitation_or_invitation(user, user_params, jurisdiction_id)
    if user.present?
      reinvite_user(user, user_params, jurisdiction_id)
      results[:reinvited] << user
    else
      user = invite_new_user(user_params, jurisdiction_id)
      results[:invited] << user
    end
  end

  def reinvite_user(user, user_params, jurisdiction_id)
    user.update(
      user_params.merge(
        discarded_at: nil,
        confirmed_at: nil,
        jurisdiction_ids: [jurisdiction_id].flatten
      )
    )

    user.skip_confirmation_notification!
    user.invite!(inviter)
  end

  def invite_new_user(user_params, jurisdiction_id)
    user =
      User.new(
        user_params.merge(
          discarded_at: nil,
          jurisdiction_ids: [jurisdiction_id].flatten
        )
      )

    user.skip_confirmation_notification!
    user.save!
    user.invite!(inviter)
    user
  end
end
