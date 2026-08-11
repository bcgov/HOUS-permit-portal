class Api::ReleaseNotesController < Api::ApplicationController
  include Api::Concerns::Search::ReleaseNotes

  skip_before_action :authenticate_user!, only: %i[index years viewer_context]
  skip_before_action :require_confirmation, only: %i[index years viewer_context]

  before_action :set_release_note, only: %i[update publish show viewer_context]

  def create
    authorize :release_note, :create?

    @release_note = ReleaseNote.new(release_note_params)
    if @release_note.save
      render_success @release_note,
                     "release_note.create_success",
                     { blueprint: ReleaseNoteBlueprint }
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
    if @release_note.published?
      return(
        render_error "release_note.update_error",
                     {
                       message_opts: {
                         error_message:
                           "Published release notes cannot be saved as drafts"
                       }
                     }
      )
    end

    if @release_note.update(release_note_attributes)
      render_success @release_note,
                     "release_note.update_success",
                     { blueprint: ReleaseNoteBlueprint }
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

  def publish
    authorize @release_note
    was_published = @release_note.published?

    if @release_note.update(release_note_attributes.merge(status: :published))
      unless was_published
        NotificationService.publish_release_note_publish_event(@release_note)
      end
      render_success @release_note,
                     "release_note.publish_success",
                     { blueprint: ReleaseNoteBlueprint }
    else
      render_error "release_note.publish_error",
                   {
                     message_opts: {
                       error_message:
                         @release_note.errors.full_messages.join(", ")
                     }
                   }
    end
  end

  def years
    authorize :release_note, :index?
    release_years =
      policy_scope(ReleaseNote)
        .published
        .order(release_date: :desc)
        .pluck(:release_date)
        .map(&:year)
        .uniq

    render json: { data: release_years, meta: default_meta(nil) }, status: :ok
  end

  def index
    authorize :release_note, :index?
    perform_release_note_search
    release_note_results = @release_note_search.results

    render_success release_note_results,
                   nil,
                   {
                     meta: page_meta(@release_note_search),
                     blueprint: ReleaseNoteBlueprint
                   }
  end

  def show
    authorize @release_note
    render_success @release_note, nil, { blueprint: ReleaseNoteBlueprint }
  end

  def viewer_context
    authorize @release_note, :viewer_context?
    context =
      ReleaseNoteViewerContext.call(
        release_note: @release_note,
        scope: policy_scope(ReleaseNote),
        per_page: release_note_viewer_context_params[:per_page]
      )

    render json: { data: context, meta: default_meta(nil) }, status: :ok
  end

  private

  def set_release_note
    begin
      @release_note = policy_scope(ReleaseNote).find(params[:id])
    rescue ActiveRecord::RecordNotFound => e
      render_error "misc.not_found_error", { status: 404 }, e
    end
  end

  def release_note_params
    params.fetch(:release_note, {}).permit(
      :release_type,
      :version,
      :name,
      :release_date,
      :content,
      :release_notes_url,
      :issues
    )
  end

  # release_type is create-only; updates ignore it (model also rejects changes)
  def release_note_attributes
    release_note_params.except(:release_type)
  end

  def release_note_viewer_context_params
    params.permit(:per_page)
  end
end
