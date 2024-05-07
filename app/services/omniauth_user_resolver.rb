class OmniauthUserResolver
  attr_reader :auth, :invitation_token, :existing_user
  attr_accessor :user, :invited_user, :error_key

  def initialize(auth:, invitation_token:)
    @auth = auth
    @invitation_token = invitation_token
    @invited_user ||= User.find_by_invitation_token(invitation_token, true)
    @existing_user ||= User.find_by(omniauth_provider:, omniauth_uid:)
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
    self.error_key = error_message_key unless user&.valid? && user&.persisted?
  end

  def should_promote_user?
    return unless existing_user&.submitter? && invited_user.present?
    exisiting_user.id != invited_user.id
  end

  def create_user
    return if omniauth_provider == "idir"
    u =
      User.new(
        password: Devise.friendly_token[0, 20],
        omniauth_provider:,
        omniauth_uid:,
        omniauth_email:,
        omniauth_username:,
      )
    # skip confirmation until user has a chance to add/verify their notification email
    u.skip_confirmation_notification!
    u.save
    u
  end

  def accept_invitation_with_omniauth
    return unless invited_user.present?

    # If IDIR, validate that the invited user's email matches the IDIR email ONLY on invite

    invited_user.update(
      password: Devise.friendly_token[0, 20],
      omniauth_provider:,
      omniauth_uid:,
      omniauth_email:,
      omniauth_username:,
    )
    invited_user.accept_invitation! if invited_user.valid?
  end

  def error_message_key
    return "omniauth.unavailable" if user.blank?
    return "omniauth.idir_failure_with_message" if user.super_admin?
    "omniauth.bceid_failure_with_message"
  end

  def raw_info
    @raw_info ||= auth.extra.raw_info
  end

  def omniauth_provider
    @provider ||= raw_info.identity_provider
  end

  def omniauth_uid
    @uid ||= raw_info.bceid_user_guid || raw_info.idir_user_guid
  end

  def omniauth_email
    @email ||= auth.info.email
  end

  def omniauth_username
    @username ||= raw_info.bceid_username || raw_info.idir_username
  end
end
