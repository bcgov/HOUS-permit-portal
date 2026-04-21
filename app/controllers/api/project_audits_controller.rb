class Api::ProjectAuditsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectAudits

  # policy_scope is applied inside the concern via perform_project_audit_search
  skip_after_action :verify_policy_scoped, only: %i[index]

  before_action :set_permit_project

  def index
    authorize @permit_project, :show?
    perform_project_audit_search

    render_success @search,
                   nil,
                   {
                     meta: page_meta(@search),
                     blueprint: ProjectAuditBlueprint,
                     blueprint_opts: {
                       view: :base,
                       viewer: current_user
                     }
                   }
  end

  private

  def set_permit_project
    scope = PermitProject.all
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error("misc.not_found_error", { status: :not_found }, e)
  end
end
