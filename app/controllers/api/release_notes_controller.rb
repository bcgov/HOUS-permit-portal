class Api::ReleaseNotesController < Api::ApplicationController
  before_action :set_release_note, only: %i[update]

  def create
    @release_note = ReleaseNote.new(release_note_params)
    authorize @release_note

    if @release_note.save
      render_success @release_note,
                     "release_note.create_success",
                     {
                       blueprint: ReleaseNoteBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "release_note.create_error",
                   {
                     message_opts: {
                       error_message:
                         @release_note.errors.full_messages.join(", ")
                     }
                   }
    end
  end

  def update
    authorize @release_note
    if @release_note.update(release_note_params)
      render_success @release_note,
                     "release_note.update_success",
                     {
                       blueprint: ReleaseNoteBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "release_note.update_error",
                   {
                     message_opts: {
                       error_message:
                         @release_note.errors.full_messages.join(", ")
                     }
                   }
    end
  end

  private

  def set_release_note
    @release_note = ReleaseNote.find(params[:id])
  end

  def release_note_params
    params.require(:release_note).permit(
      :version,
      :release_date,
      :content,
      :release_notes_url,
      :issues
    )
  end
end
