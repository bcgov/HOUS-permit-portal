class Api::HelpVideoSectionsController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  skip_before_action :require_confirmation, only: %i[index show]

  before_action :set_help_video_section,
                only: %i[show update destroy reorder_videos]

  def index
    sections =
      policy_scope(HelpVideoSection).ordered.includes(help_videos: :documents)
    include_unpublished = current_user&.super_admin?

    render_success(
      sections,
      nil,
      {
        blueprint: HelpVideoSectionBlueprint,
        blueprint_opts: {
          include_unpublished: include_unpublished
        }
      }
    )
  end

  def show
    authorize @help_video_section

    render_success(
      @help_video_section,
      nil,
      {
        blueprint: HelpVideoSectionBlueprint,
        blueprint_opts: {
          include_unpublished: current_user&.super_admin?
        }
      }
    )
  end

  def create
    section = HelpVideoSection.new(help_video_section_params)
    authorize section

    if section.save
      render_success(section, "help_video_section.create_success")
    else
      render_validation_error(section)
    end
  end

  def update
    authorize @help_video_section

    if @help_video_section.update(help_video_section_params)
      render_success(@help_video_section, "help_video_section.update_success")
    else
      render_validation_error(@help_video_section)
    end
  end

  def destroy
    authorize @help_video_section

    if @help_video_section.destroy
      render_success(nil, "help_video_section.destroy_success")
    else
      render_validation_error(@help_video_section)
    end
  end

  def reorder
    authorize HelpVideoSection, :update?

    ordered_ids = params[:ordered_ids] || []
    sections = HelpVideoSection.where(id: ordered_ids)

    if sections.size != ordered_ids.size
      return render_error "misc.not_found_error", { status: :not_found }
    end

    HelpVideoSection.transaction do
      ordered_ids.each_with_index do |id, index|
        sections.find { |section| section.id == id }.insert_at(index)
      end
    end

    render_success(
      HelpVideoSection.ordered.includes(help_videos: :documents),
      "help_video_section.reorder_success",
      {
        blueprint: HelpVideoSectionBlueprint,
        blueprint_opts: {
          include_unpublished: current_user&.super_admin?
        }
      }
    )
  end

  def reorder_videos
    authorize @help_video_section, :update?

    ordered_ids = params[:ordered_ids] || []
    videos = @help_video_section.help_videos.where(id: ordered_ids)

    unless videos.size == ordered_ids.size &&
             ordered_ids.sort == @help_video_section.help_video_ids.sort
      return render_error "misc.not_found_error", { status: :not_found }
    end

    HelpVideo.transaction do
      ordered_ids.each_with_index do |id, index|
        videos.find { |video| video.id == id }.insert_at(index)
      end
    end

    render_success(
      @help_video_section.reload,
      nil,
      {
        blueprint: HelpVideoSectionBlueprint,
        blueprint_opts: {
          include_unpublished: current_user&.super_admin?
        }
      }
    )
  end

  private

  def set_help_video_section
    @help_video_section = HelpVideoSection.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: :not_found }, e
  end

  def help_video_section_params
    params.require(:help_video_section).permit(:title, :description)
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
