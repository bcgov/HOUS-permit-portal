class Api::HelpVideosController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  skip_before_action :require_confirmation, only: %i[index show]

  before_action :set_help_video, only: %i[show update destroy publish unpublish]

  def index
    videos =
      policy_scope(HelpVideo).ordered.includes(
        :help_video_section,
        :video_document,
        :caption_document,
        :transcript_document
      )

    render_success(videos, nil, { blueprint: HelpVideoBlueprint })
  end

  def show
    authorize @help_video

    render_success(
      @help_video,
      nil,
      { blueprint: HelpVideoBlueprint, blueprint_opts: { view: :detail } }
    )
  end

  def create
    video = HelpVideo.new(help_video_params)
    authorize video

    if video.save
      render_success(video, "help_video.create_success")
    else
      render_validation_error(video)
    end
  end

  def update
    authorize @help_video
    @help_video.assign_attributes(help_video_params)

    if @help_video.save
      render_success(@help_video, "help_video.update_success")
    else
      render_validation_error(@help_video)
    end
  end

  def destroy
    authorize @help_video

    @help_video.destroy!
    render_success(nil, "help_video.destroy_success")
  end

  def publish
    authorize @help_video

    if @help_video.update(published_at: Time.current)
      render_success(@help_video, "help_video.publish_success")
    else
      render_validation_error(@help_video)
    end
  end

  def unpublish
    authorize @help_video

    if @help_video.update(published_at: nil)
      render_success(@help_video, "help_video.unpublish_success")
    else
      render_validation_error(@help_video)
    end
  end

  private

  def set_help_video
    @help_video =
      HelpVideo
        .includes(
          :help_video_section,
          :video_document,
          :caption_document,
          :transcript_document
        )
        .friendly
        .find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: :not_found }, e
  end

  def help_video_params
    params.require(:help_video).permit(
      :help_video_section_id,
      :title,
      :description_html,
      :publish,
      video_document_attributes: document_attributes,
      caption_document_attributes: document_attributes,
      transcript_document_attributes: document_attributes
    )
  end

  def document_attributes
    [
      :id,
      :_destroy,
      {
        file: [
          :id,
          :storage,
          { metadata: %i[filename size mime_type content_disposition] }
        ]
      }
    ]
  end

  def render_validation_error(record)
    render_error(
      "misc.validation_error",
      {
        message_opts: {
          error_message: record.errors.full_messages.join(", ")
        }
      }
    )
  end
end
