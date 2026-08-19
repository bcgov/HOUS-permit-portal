class Api::PermitProjects::TeamsController < Api::ApplicationController
  before_action :set_permit_project
  before_action :set_project_team, only: %i[update destroy]

  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    authorize @permit_project, :index?, policy_class: ProjectTeamPolicy

    render_success @permit_project.ordered_teams, nil, blueprint_options
  end

  def create
    authorize @permit_project, :create?, policy_class: ProjectTeamPolicy

    project_team = @permit_project.project_teams.new(project_team_params)
    project_team.kind = :custom

    if save_with_memberships(project_team)
      render_success project_team,
                     "project_team.create_success",
                     blueprint_options
    else
      render_team_error(project_team, "project_team.create_error")
    end
  end

  def update
    authorize @project_team

    @project_team.assign_attributes(project_team_params)

    if save_with_memberships(@project_team)
      render_success @project_team,
                     "project_team.update_success",
                     blueprint_options
    else
      render_team_error(@project_team, "project_team.update_error")
    end
  end

  def destroy
    authorize @project_team

    if @project_team.destroy
      render_success @project_team,
                     "project_team.destroy_success",
                     blueprint_options
    else
      render_team_error(@project_team, "project_team.destroy_error")
    end
  end

  private

  def blueprint_options
    { blueprint: ProjectTeamBlueprint, blueprint_opts: { view: :base } }
  end

  def set_permit_project
    scope = PermitProject.includes(:jurisdiction, :project_teams)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def set_project_team
    @project_team = @permit_project.project_teams.find(params[:id])
  end

  # The team and its membership list move together, so a rejected join row does
  # not leave a team with the wrong members behind.
  def save_with_memberships(project_team)
    ProjectTeam.transaction do
      raise ActiveRecord::Rollback unless project_team.save

      sync_team_memberships(project_team)
      true
    end
  rescue ActiveRecord::RecordInvalid => e
    project_team.errors.add(:base, e.message)
    false
  end

  # Auto team membership is derived from role, so only custom teams take an
  # explicit list. Ids are resolved through the project, so an id belonging to
  # another project is dropped rather than raising.
  def sync_team_memberships(project_team)
    return unless project_team.custom?

    requested_ids = params.require(:project_team)[:project_membership_ids]
    return if requested_ids.nil?

    project_team.project_membership_ids =
      @permit_project
        .project_memberships
        .kept
        .where(id: Array(requested_ids))
        .ids
  end

  def render_team_error(project_team, message_key)
    render_error(
      message_key,
      {
        status: :unprocessable_entity,
        log_args: {
          errors: project_team.errors.full_messages
        }
      }
    )
  end

  def project_team_params
    params.require(:project_team).permit(
      :name,
      :project_access,
      :collaborator_access,
      :meeting_access
    )
  end
end
