class Api::ProjectMeetingNotesController < Api::ApplicationController
  before_action :set_project_meeting

  def index
    notes =
      policy_scope(Note)
        .where(noteable: @project_meeting)
        .includes(:user, noteable: :permit_project)
        .order(created_at: :desc)

    render_success notes, nil, { blueprint: NoteBlueprint }
  end

  def create
    authorize @project_meeting, :create_note?

    note =
      @project_meeting.notes.build(user: current_user, body: note_params[:body])

    if note.save
      render_success note,
                     "note.create_success",
                     { blueprint: NoteBlueprint, status: :created }
    else
      render_error(
        "note.create_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: note.errors.full_messages,
            params: note_params.to_h
          }
        }
      )
    end
  end

  def download_csv
    authorize @project_meeting, :download_notes_csv?

    notes =
      policy_scope(Note)
        .where(noteable: @project_meeting)
        .includes(:user, noteable: :permit_project)
        .order(created_at: :asc)

    send_data NotesExportService.new(notes).to_csv,
              filename: "project-meeting-notes-#{@project_meeting.id}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  private

  def set_project_meeting
    clauses = ["permit_projects.owner_id = :uid"]
    values = { uid: current_user.id }

    if current_user.review_staff?
      review_clauses = [
        "permit_projects.jurisdiction_id IN (:jur_ids)",
        (
          if current_sandbox.present?
            "permit_projects.sandbox_id = :sandbox_id"
          else
            "permit_projects.sandbox_id IS NULL"
          end
        )
      ]
      clauses << review_clauses.join(" AND ")
      values[:jur_ids] = current_user.jurisdictions.pluck(:id)
      values[:sandbox_id] = current_sandbox.id if current_sandbox.present?
    end

    scope =
      ProjectMeeting
        .includes(:permit_project)
        .joins(:permit_project)
        .where(clauses.map { |clause| "(#{clause})" }.join(" OR "), values)

    @project_meeting = scope.find(params[:project_meeting_id])
  end

  def note_params
    params.require(:note).permit(:body)
  end
end
