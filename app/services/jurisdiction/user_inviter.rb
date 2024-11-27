class Jurisdiction::UserInviter
  attr_accessor :results
  attr_reader :inviter, :users_params

  def initialize(inviter:, users_params:)
    @inviter = inviter
    @users_params = users_params
    @results = { invited: [], reinvited: [], email_taken: [] }
  end

  def call
    invite_users
    # TODO: Consider intercom
    # publish_intercom_event
    return self
  end

  def invite_users
    users_params.each do |user_params|
      user =
        User
          .where.not(role: :submitter)
          .find_by(email: user_params[:email].strip)
      is_invitable_role_param =
        inviter.invitable_roles.include?(user_params[:role].to_s)
      regional_rm_selected =
        user_params[:role].to_sym == :regional_review_manager
      if user.present? && user.confirmed? &&
           (!regional_rm_selected || user.super_admin?)
        results[:email_taken] << user
      elsif user.present? && !user.discarded? && regional_rm_selected &&
            is_invitable_role_param &&
            (jurisdiction_id = user_params[:jurisdiction_id])
        user.update(role: :regional_review_manager)
        membership =
          user
            .jurisdiction_memberships
            .where(jurisdiction_id:)
            .first_or_create do |m|
              if user.confirmed?
                PermitHubMailer.new_jurisdiction_membership(
                  user,
                  jurisdiction_id
                ).deliver_later
              end
            end
        # The purpose of touch is to allow the jurisdiction to be obtained in the user blueprint invited_user view
        membership.touch
        user.invite!(inviter) unless user.confirmed?
        results[:invited] << user
      else
        reinvited = user.present?
        if reinvited
          if is_invitable_role_param
            user.update(role: user_params[:role].to_sym)
          end
          user.skip_confirmation_notification!
          user.invite!(inviter)
          results[:reinvited] << user
        elsif is_invitable_role_param
          jurisdiction_id =
            user_params.delete(:jurisdiction_id) ||
              inviter.jurisdictions.pluck(:id)
          user =
            User.new(
              user_params.merge(
                {
                  discarded_at: nil,
                  jurisdiction_ids: [jurisdiction_id].flatten
                }
              )
            )
          user.skip_confirmation_notification!
          user.save!
          user.invite!(inviter)

          results[:invited] << user
        end
      end
    end
  end
end
