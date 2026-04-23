class Api::ReleaseNotesController < Api::ApplicationController
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
                   @release_note.errors.full_messages
    end
  end

  private

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
