class Api::PermitProjects::MembershipsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectMemberships

  before_action :set_permit_project

  # The payload includes the owner, who is not a membership row.
  skip_after_action :verify_policy_scoped, only: :index

  def index
    # MEMBERSHIP COMMENT - currently this shows all project memebers to everyone - confirm this later
    authorize @permit_project, :show?
    perform_project_membership_search

    render_success project_people_rows, nil, { meta: project_people_meta }
  end

  private

  def set_permit_project
    # MEMBERSHIP COMMENT - currently depends on owner
    scope = PermitProject.includes(:owner)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end
end
