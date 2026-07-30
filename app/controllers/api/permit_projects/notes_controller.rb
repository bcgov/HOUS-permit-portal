class Api::PermitProjects::NotesController < Api::ApplicationController
  before_action :set_permit_project

  def index
    authorize @permit_project, :show?

    notes = notes_scope.order(created_at: :desc)

    render_success notes, nil, { blueprint: NoteBlueprint }
  end

  def download_csv
    authorize @permit_project, :download_notes_csv?

    send_data NotesExportService.new(
                notes_scope.order(created_at: :asc)
              ).to_csv,
              filename: "project-notes-#{@permit_project.id}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  private

  def set_permit_project
    scope = PermitProject.includes(:jurisdiction)
    scope = scope.for_sandbox(current_sandbox) unless current_user.super_admin?
    @permit_project = scope.find(params[:permit_project_id])
  end

  def notes_scope
    policy_scope(Note).where(permit_project: @permit_project).preload(
      :user,
      :permit_project,
      :note_attachment_documents
    )
  end
end
