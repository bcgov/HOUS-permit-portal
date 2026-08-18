class Api::PermitProjects::TeamsController < Api::ApplicationController
  before_action :set_permit_project
  before_action :set_project_team, only: %i[update]

  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    authorize @permit_project, :index?, policy_class: ProjectTeamPolicy

    # COLLAB TODO(phase 2): custom teams (e.g. viewers, plumbers) with explicit
    # membership and granular per-record permissions.
    render_success @permit_project.auto_teams,
                   nil,
                   {
                     blueprint: ProjectTeamBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  def update
    authorize @project_team

    if @project_team.update(project_team_params)
      render_success @project_team,
                     "project_team.update_success",
                     {
                       blueprint: ProjectTeamBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error(
        "project_team.update_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: @project_team.errors.full_messages,
            params: project_team_params.to_h
          }
        }
      )
    end
  end

  private

  def set_permit_project
    scope = PermitProject.includes(:jurisdiction, :project_teams)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_project_team
    @project_team = @permit_project.project_teams.find(params[:id])
  end

  def project_team_params
    params.require(:project_team).permit(
      :project_access,
      :collaborator_access,
      :team_access
    )
  end
end
