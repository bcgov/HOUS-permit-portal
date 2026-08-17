# Adds a user to a project as a lead or contributor, creating and inviting the
# user when they are not in the system yet. Mirrors the find-or-create-submitter
# flow of PermitCollaboration::CollaborationManagementService.
class ProjectMembership::InviteService
  class Error < StandardError
  end

  attr_reader :permit_project, :inviter

  def initialize(permit_project:, inviter:)
    @permit_project = permit_project
    @inviter = inviter
  end

  def invite!(role:, user_params: nil, user_id: nil)
    ActiveRecord::Base.transaction do
      user =
        (
          if user_id.present?
            User.find(user_id)
          else
            find_or_create_user!(user_params)
          end
        )

      if user.id == permit_project.owner_id
        raise Error,
              I18n.t("services.project_membership.invite.owner_already_member")
      end

      membership = upsert_membership!(user, role)
      send_invitation_email(user)
      membership
    end
  end

  # Resends the registration invitation to someone who has not signed up yet.
  def reinvite!(membership)
    user = membership.user

    unless user.confirmed?
      user.skip_confirmation_notification!
      user.invite!(inviter)
    end

    membership
  end

  private

  def upsert_membership!(user, role)
    # Reuse a previously removed membership so re-adding someone does not leave
    # two rows behind.
    membership =
      permit_project.project_memberships.find_or_initialize_by(user_id: user.id)
    membership.discarded_at = nil
    membership.role = role
    membership.invited_by = inviter

    return membership if membership.save

    raise Error,
          I18n.t(
            "services.project_membership.invite.membership_error",
            error_message: membership.errors.full_messages.join(", ")
          )
  end

  def find_or_create_user!(user_params)
    if user_params.blank? || user_params[:email].blank?
      raise Error, I18n.t("services.project_membership.invite.email_required")
    end

    email = user_params[:email].strip
    existing =
      User.where(omniauth_email: email).or(User.where(email: email)).first
    return existing if existing

    user =
      User.new(
        first_name: user_params[:first_name],
        last_name: user_params[:last_name],
        email: email,
        role: :submitter
      )
    user.skip_confirmation_notification!

    return user if user.save

    raise Error,
          I18n.t(
            "services.project_membership.invite.create_user_error",
            error_message: user.errors.full_messages.join(", ")
          )
  end

  # TODO(phase 1 follow-up): notify users who already have a confirmed account
  # that they were added to a project (needs a new mailer template, and an
  # in-app notification once membership notification types exist).
  def send_invitation_email(user)
    return if user.confirmed?

    user.skip_confirmation_notification!
    user.invite!(inviter)
  end
end
