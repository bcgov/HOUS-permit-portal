class Jurisdiction::UserInviter
  attr_accessor :results
  attr_reader :inviter, :users_params

  def initialize(inviter:, users_params:)
    @inviter = inviter
    @users_params = users_params
    @results = { invited: [], email_taken: [] }
  end

  def call
    invite_users
    # TODO: Consider intercom
    # publish_intercom_event
    return self
  end

  def invite_users
    users_params.each do |user_params|
      user = User.find_by(email: user_params[:email].strip)
      if user
        self.results[:email_taken] << user
      else
        user =
          User.invite!(email: user_params[:email]) do |u|
            u.skip_confirmation_notification!
            u.role = user_params[:role] if User.invitable_roles.include?(user_params[:role])
            u.email = user_params[:email]
            u.username = user_params[:email]
            u.first_name = user_params[:first_name]
            u.last_name = user_params[:last_name]
            u.invited_by = inviter
            u.jurisdiction_id = inviter.super_admin? ? user_params[:jurisdiction_id] : inviter.jurisdiction&.id
            u.save
          end

        # send instructions

        # user.deliver_invitation
        self.results[:invited] << user
      end
    end
  end
end
