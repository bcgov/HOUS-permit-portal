# Creates a pending project membership addressed to an email. No User is
# attached (and no project access is granted) until the invitee accepts.
class ProjectMembership::InviteService
  class Error < StandardError
  end

  attr_reader :permit_project, :inviter

  def initialize(permit_project:, inviter:)
    @permit_project = permit_project
    @inviter = inviter
  end

  def invite!(role:, user_params: nil)
    email = normalize_email(user_params&.[](:email) || user_params&.[]("email"))
    if email.blank?
      raise Error, I18n.t("services.project_membership.invite.email_required")
    end
    if owner_email?(email)
      raise Error,
            I18n.t("services.project_membership.invite.owner_already_member")
    end

    membership = upsert_pending_membership!(email, role)
    raw = membership.issue_invitation_token!
    send_invitation_email(membership, raw)
    membership
  end

  def reinvite!(membership)
    unless membership.pending?
      raise Error, I18n.t("services.project_membership.invite.already_accepted")
    end

    raw = membership.issue_invitation_token!
    send_invitation_email(membership, raw)
    membership
  end

  private

  def upsert_pending_membership!(email, role)
    membership =
      permit_project.project_memberships.kept.find_by(invited_email: email) ||
        permit_project.project_memberships.discarded.find_by(
          invited_email: email
        ) || permit_project.project_memberships.new(invited_email: email)

    if membership.kept? && membership.accepted?
      raise Error, I18n.t("services.project_membership.invite.already_invited")
    end

    membership.assign_attributes(
      role: role,
      invited_by: inviter,
      discarded_at: nil,
      user: nil,
      accepted_at: nil
    )

    return membership if membership.save

    raise Error,
          I18n.t(
            "services.project_membership.invite.membership_error",
            error_message: membership.errors.full_messages.join(", ")
          )
  end

  def send_invitation_email(membership, raw_token)
    PermitHubMailer.notify_project_membership_invitation(
      project_membership: membership,
      raw_token: raw_token
    ).deliver_later
  end

  def normalize_email(email)
    email.to_s.strip.downcase.presence
  end

  def owner_email?(email)
    owner = permit_project.owner
    return false if owner.blank?

    [owner.email, owner.omniauth_email].compact.any? do |owner_email|
      owner_email.to_s.strip.downcase == email
    end
  end
end
