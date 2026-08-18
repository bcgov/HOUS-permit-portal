class Api::PermitProjects::MembershipsController < Api::ApplicationController
  before_action :set_permit_project
  before_action :set_project_membership, only: %i[update destroy reinvite]

  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    authorize @permit_project, :index?, policy_class: ProjectMembershipPolicy

    render_success memberships_scope,
                   nil,
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  def create
    authorize @permit_project, :create?, policy_class: ProjectMembershipPolicy

    membership =
      ProjectMembership::InviteService.new(
        permit_project: @permit_project,
        inviter: current_user
      ).invite!(role: membership_params[:role], user_params: user_params)

    render_success membership,
                   "project_membership.create_success",
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  rescue ProjectMembership::InviteService::Error => e
    render_error "project_membership.create_error",
                 {
                   status: :unprocessable_entity,
                   message_opts: {
                     error_message: e.message
                   }
                 }
  end

  def update
    authorize @project_membership

    if @project_membership.update(role: membership_params[:role])
      render_success @project_membership,
                     "project_membership.update_success",
                     {
                       blueprint: ProjectMembershipBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error(
        "project_membership.update_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: @project_membership.errors.full_messages
          }
        }
      )
    end
  end

  def destroy
    authorize @project_membership

    if @project_membership.discard
      render_success @project_membership,
                     "project_membership.destroy_success",
                     {
                       blueprint: ProjectMembershipBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error(
        "project_membership.destroy_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: @project_membership.errors.full_messages
          }
        }
      )
    end
  end

  def reinvite
    authorize @project_membership, :reinvite?

    ProjectMembership::InviteService.new(
      permit_project: @permit_project,
      inviter: current_user
    ).reinvite!(@project_membership)

    render_success @project_membership,
                   "project_membership.reinvite_success",
                   {
                     blueprint: ProjectMembershipBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  private

  def memberships_scope
    @permit_project
      .project_memberships
      .kept
      .includes(:user, :invited_by)
      .order(created_at: :asc)
  end

  def set_permit_project
    scope = PermitProject.includes(:jurisdiction, :project_teams)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_project_membership
    @project_membership =
      @permit_project.project_memberships.kept.find(params[:id])
  end

  def membership_params
    params.require(:project_membership).permit(:role)
  end

  def user_params
    params[:user]&.permit(:email)
  end
end
