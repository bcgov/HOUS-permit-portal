class Api::ProjectAuditsController < Api::ApplicationController
  include Api::Concerns::Search::ProjectAudits

  # policy_scope is applied inside the concern via perform_project_audit_search
  skip_after_action :verify_policy_scoped, only: %i[index]

  before_action :set_permit_project

  def index
    authorize @permit_project, :show?
    perform_project_audit_search

    # ── COLLABORATOR VISIBILITY QUESTION ──
    #
    # Right now every audit that passes the policy_scope is formatted and
    # returned. For assignee collaborators (scoped to specific requirement
    # blocks), we may need to filter or redact entries here.
    #
    # One approach: preload the viewer's permissions once, then pass them
    # into the presenter so it can skip/redact per-entry without N+1:
    #
    #   permissions_by_pa = @permit_project.permit_applications
    #     .index_with { |pa| pa.submission_requirement_block_edit_permissions(user_id: current_user.id) }
    #
    # Then the presenter could check: "does the viewer have access to the
    # permit_application and/or requirement_block this audit references?"
    #
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
    @permit_project = PermitProject.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error("misc.not_found_error", { status: :not_found }, e)
  end
end
