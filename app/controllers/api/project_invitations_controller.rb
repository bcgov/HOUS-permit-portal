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
        status: @membership.status
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

    project_id = @membership.permit_project_id
    project_title = @membership.permit_project.title

    ProjectMembership.transaction do
      existing =
        @membership.permit_project.project_memberships.find_by(
          user_id: current_user.id
        )

      if existing
        # A second invite never lowers access.
        existing.access =
          [existing.access, @membership.access].max_by do |level|
            ProjectMembership.accesses[level]
          end
        existing.role_tags = (existing.role_list + @membership.role_list).uniq
        if !existing.primary? && @membership.contact_designation != "none"
          existing.contact_designation = @membership.contact_designation
        end
        @membership.destroy!
        existing.save!
      else
        @membership.user = current_user
        @membership.invitation_accepted_at = Time.current
        @membership.invitation_token = nil
        @membership.save!
      end
    end

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
