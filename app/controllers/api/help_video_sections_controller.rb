class Api::HelpVideoSectionsController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: %i[index show]
  skip_before_action :require_confirmation, only: %i[index show]

  before_action :set_help_video_section, only: %i[show update destroy]

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

    @help_video_section.destroy!
    render_success(nil, "help_video_section.destroy_success")
  end

  private

  def set_help_video_section
    @help_video_section = HelpVideoSection.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: :not_found }, e
  end

  def help_video_section_params
    params.require(:help_video_section).permit(
      :title,
      :description,
      :sort_order
    )
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
