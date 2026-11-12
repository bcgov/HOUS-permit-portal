class Api::ProjectInvitationsController < Api::ApplicationController
  before_action :set_membership

  # MEMBERSHIP COMMENT - submitters only. Accept does not check sandbox.
  # If reviewers can accept later, a reviewer in another sandbox could accept
  # and then be denied on the overview redirect. See PermitProjectsController#show.
  def show
    authorize @membership, :show_invitation?

    render_success(
      {
        project_id: @membership.permit_project_id,
        project_title: @membership.permit_project.title,
        invited_by_name: @membership.invited_by&.name,
        status: @membership.status,
        already_member: already_a_member?
      }
    )
  end

  def accept
    authorize @membership, :accept_invitation?

    if @membership.expired?
      return(
        render_error(
          "project_invitation.expired_error",
          { status: :unprocessable_content }
        )
      )
    end

    if already_a_member?
      return(
        render_error(
          "project_invitation.already_member",
          { status: :unprocessable_content }
        )
      )
    end

    project_id = @membership.permit_project_id
    project_title = @membership.permit_project.title

    @membership.update!(
      user: current_user,
      invitation_accepted_at: Time.current,
      invitation_token: nil
    )

    render_success(
      { permit_project_id: project_id, project_title: project_title }
    )
  end

  def decline
    authorize @membership, :decline_invitation?

    if @membership.expired?
      return(
        render_error(
          "project_invitation.expired_error",
          { status: :unprocessable_content }
        )
      )
    end

    project_title = @membership.permit_project.title
    @membership.destroy!

    render_success({ project_title: project_title })
  end

  private

  def already_a_member?
    @membership
      .permit_project
      .project_memberships
      .where.not(id: @membership.id)
      .exists?(user_id: current_user.id)
  end

  def set_membership
    digest =
      Devise.token_generator.digest(
        ProjectMembership,
        :invitation_token,
        params[:token]
      )
    @membership =
      ProjectMembership.includes(:permit_project, :invited_by).find_by!(
        invitation_token: digest
      )
  end
end
