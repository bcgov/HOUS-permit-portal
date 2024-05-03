class OmniauthUserResolver
  attr_reader :auth, :invitation_token, :existing_user
  attr_accessor :user, :invited_user

  def initialize(auth:, invitation_token:)
    @auth = auth
    @invitation_token = invitation_token
    @invited_user ||= User.find_by_invitation_token(invitation_token, true)
    @existing_user ||=
      User.find_by(
        auth_provider: auth.extra.raw_info.identity_provider,
        bceid_user_guid: auth.extra.raw_info.bceid_user_guid,
      )
  end

  def call
    resolve_user
    return self
  end

  private

  def resolve_user
    if should_promote_user?
      result = MergeSubmitterWithInvitedUser.new(submitter: existing_user, invited_user:).call
      self.invited_user = result.submitter
    end
    accept_invitation_with_omniauth if invited_user.present?

    self.user = invited_user || existing_user || create_user
  end

  def should_promote_user?
    return unless existing_user&.submitter? && invited_user.present?
    exisiting_user.id != invited_user.id
  end

  def create_user
    u =
      User.new(
        auth_provider: auth.extra.raw_info.identity_provider,
        bceid_user_guid: auth.extra.raw_info.bceid_user_guid,
        password: Devise.friendly_token[0, 20],
        # BCeID readonly info
        bceid_email: auth.info.email,
        bceid_username: auth.extra.raw_info.bceid_username,
      )
    # skip confirmation until user has a chance to add/verify their profile info
    u.skip_confirmation_notification!
    u.save
    u
  end

  def accept_invitation_with_omniauth
    return unless invited_user.present?

    invited_user.update(
      password: Devise.friendly_token[0, 20],
      auth_provider: auth.extra.raw_info.identity_provider,
      bceid_user_guid: auth.extra.raw_info.bceid_user_guid,
      bceid_email: auth.info.email,
      bceid_username: auth.extra.raw_info.bceid_username,
    )
    invited_user.accept_invitation! if invited_user.valid?
  end
end
