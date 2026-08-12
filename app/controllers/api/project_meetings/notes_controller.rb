class Api::ProjectMeetings::NotesController < Api::ApplicationController
  before_action :set_project_meeting

  def index
    authorize @project_meeting, :view_notes?

    notes =
      policy_scope(Note)
        .where(noteable: @project_meeting)
        .preload(:user, :permit_project, :note_attachment_documents)
        .order(created_at: :desc)

    render_success notes, nil, { blueprint: NoteBlueprint }
  end

  def create
    authorize @project_meeting, :create_note?

    note = @project_meeting.notes.build(note_params.merge(user: current_user))

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
        .preload(:user, :permit_project, :note_attachment_documents)
        .order(created_at: :asc)

    send_data NotesExportService.new(notes).to_csv,
              filename: "project-meeting-notes-#{@project_meeting.id}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  private

  def set_project_meeting
    @project_meeting =
      ProjectMeeting.preload(:permit_project).find(params[:project_meeting_id])
  end

  def note_params
    params.require(:note).permit(
      :body,
      note_attachment_documents_attributes: [
        file: [:id, :storage, { metadata: %i[size filename mime_type] }]
      ]
    )
  end
end
