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

      user = find_existing_invited_user(user_params[:email], selected_role)
      jurisdiction_id =
        user_params.delete(:jurisdiction_id) || inviter.jurisdictions.pluck(:id)

      next unless inviter_authorized_for_jurisdiction?(jurisdiction_id)

      begin
        if should_promote_to_regional_rm?(user, selected_role, jurisdiction_id)
          promote_to_regional_rm(user, jurisdiction_id)
          results[:invited] << user
        elsif cannot_take_email?(user)
          results[:email_taken] << user
        else
          handle_reinvitation_or_invitation(user, user_params, jurisdiction_id)
        end
      rescue StandardError => e
        Rails.logger.error(
          "UserInviter failed for #{user_params[:email]}: #{e.class}: #{e.message}"
        )
        Rails.logger.error(e.backtrace.first(10).join("\n")) if e.backtrace
        results[:failed] << { email: user_params[:email], error: e.message }
      end
    end
  end

  private

  def inviter_authorized_for_jurisdiction?(jurisdiction_id)
    return true if inviter.super_admin?

    inviter_jurisdiction_ids = inviter.jurisdictions.pluck(:id)
    Array(jurisdiction_id).all? { |jid| inviter_jurisdiction_ids.include?(jid) }
  end

  def find_existing_invited_user(email, selected_role)
    # Inviting submitters causes a second user to be created with the same email
    # After accepting the invite, only the non-submitter User remains
    #
    # Devise downcases email on save (case_insensitive_keys default), so we
    # must normalize the search term to match.
    normalized = email.to_s.strip.downcase
    base =
      User.where.not(role: :submitter).where("LOWER(email) = ?", normalized)

    if selected_role.to_sym == :regional_review_manager
      # Prefer a kept RM, then a kept RRM, then any discarded RM/RRM
      # (promote_to_regional_rm will un-discard). Do NOT fall back to a
      # non-manager row so that "create alongside" can happen when only
      # non-managers share this email.
      base.kept.where(role: :review_manager).order(:created_at).first ||
        base
          .kept
          .where(role: :regional_review_manager)
          .order(:created_at)
          .first ||
        base
          .discarded
          .where(role: %i[review_manager regional_review_manager])
          .order(:created_at)
          .first
    else
      base.kept.order(:created_at).first || base.order(:created_at).first
    end
  end

  def cannot_take_email?(user)
    user.present? && user.confirmed? && !user.discarded?
  end

  def should_promote_to_regional_rm?(user, selected_role, jurisdiction_id)
    selected_role.to_sym == :regional_review_manager && user.present? &&
      user.promotable_to_regional_rm? && jurisdiction_id.present?
  end

  def promote_to_regional_rm(user, jurisdiction_id)
    # May already be RRM, in which case this method just adds new jurisdiction
    # memberships. If the user was discarded, we revive them as part of the
    # promotion (the caller has already decided they should be promoted).
    ActiveRecord::Base.transaction do
      user.undiscard if user.discarded?
      user.update!(role: :regional_review_manager)

      Array(jurisdiction_id).each do |jid|
        created = false
        membership =
          user
            .jurisdiction_memberships
            .find_or_create_by!(jurisdiction_id: jid) { created = true }
        membership.touch
        if created && user.confirmed?
          PermitHubMailer.new_jurisdiction_membership(user, jid).deliver_later
        end
      end

      user.invite!(inviter) unless user.confirmed?
    end
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
