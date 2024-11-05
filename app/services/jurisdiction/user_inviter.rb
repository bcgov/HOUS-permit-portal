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
      is_regional_rm =
        user&.regional_review_manager? ||
          (user && user_params[:role].to_sym == :regional_review_manager)

      if user.present? && !user.discarded? && user.confirmed? &&
           (!is_regional_rm || user.super_admin?)
        self.results[:email_taken] << user
      elsif user && is_regional_rm &&
            jurisdiction_id = user_params[:jurisdiction_id]
        if !user.regional_review_manager?
          user.update(role: :regional_review_manager)
        end
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
        user.invite!(inviter) if !user.confirmed?
        self.results[:invited] << user
      else
        reinvited = user.present?
        is_invitable_role =
          inviter.invitable_roles.include?(user_params[:role].to_s)
        if reinvited
          user.update(role: user_params[:role].to_sym) if is_invitable_role
          user.skip_confirmation_notification!
          user.invite!(inviter)
          self.results[:reinvited] << user
        elsif is_invitable_role
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

          self.results[:invited] << user
        end
      end
    end
  end
end
