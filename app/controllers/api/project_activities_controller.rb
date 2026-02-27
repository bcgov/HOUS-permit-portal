class Api::ProjectActivitiesController < Api::ApplicationController
  include Api::Concerns::Search::ProjectActivities

  before_action :set_permit_project
  # [AUDITS SUGGESTION] verify_policy_scoped is now satisfied by the
  # scope_results: policy_scope(...) in the search concern, so we no longer
  # need to skip it. verify_authorized is skipped because we authorize the
  # project explicitly rather than each audit record.
  skip_after_action :verify_authorized, only: %i[index]

  def index
    authorize @permit_project, :show?
    perform_project_activity_search

    # [AUDITS SUGGESTION] The presenter already returns hashes in the exact
    # shape the frontend needs — passing them through a Blueprinter blueprint
    # would fail (Blueprinter calls methods, not hash keys). Render directly.
    #
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
    formatted =
      @search.results.map do |audit|
        ProjectActivityPresenter.format(audit, viewer: current_user)
      end

    render json: { data: formatted, meta: page_meta(@search) }
  end

  private

  def set_permit_project
    @permit_project = PermitProject.find(params[:id])
  end
end
