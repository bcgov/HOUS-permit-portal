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
      user = User.where.not(role: :submitter).find_by(email: user_params[:email].strip)
      if user.present? && !user.discarded? && user.confirmed? && !user.regional_review_manager?
        self.results[:email_taken] << user
      elsif user&.regional_review_manager? && jurisdiction_id = user_params[:jurisdiction_id]
        user
          .jurisdiction_memberships
          .where(jurisdiction_id:)
          .first_or_create { |m| PermitHubMailer.new_jurisdiction_membership(user, jurisdiction_id).deliver_later }
        self.results[:invited] << user
      else
        reinvited = user.present?
        if reinvited
          user.skip_confirmation_notification!
          user.invite!(inviter)
          self.results[:reinvited] << user
        elsif inviter.invitable_roles.include?(user_params[:role].to_s)
          jurisdiction_id = user_params[:jurisdiction_id] || inviter.jurisdiction&.id
          user = User.new(user_params.merge({ discarded_at: nil, jurisdiction_id: }))
          user.skip_confirmation_notification!
          user.save!
          user.invite!(inviter)

          self.results[:invited] << user
        end
      end
    end
  end
end
