class Api::OverheatingController < Api::ApplicationController
  include Api::Concerns::Search::OverheatingTools
  before_action :set_overheating_tool,
                only: %i[show generate_pdf update archive restore download]
  skip_after_action :verify_policy_scoped, only: %i[index]

  def show
    authorize @overheating_tool
    render_success @overheating_tool,
                   nil,
                   { blueprint: OverheatingToolBlueprint }
  end

  def create
    @overheating_tool =
      OverheatingTool.new(
        overheating_tool_params.merge(user_id: current_user.id)
      )

    authorize @overheating_tool

    if @overheating_tool.save
      render_success @overheating_tool,
                     "overheating_tool.create_success",
                     { blueprint: OverheatingToolBlueprint, status: :created }
    else
      render_error "overheating_tool.create_error",
                   {
                     message_opts: {
                       error_message:
                         @overheating_tool.errors.full_messages.join(", ")
                     },
                     status: 422
                   }
    end
  end

  def index
    perform_search
    render_success @search.results,
                   nil,
                   {
                     blueprint: OverheatingToolBlueprint,
                     meta: page_meta(@search)
                   }
  end

  def generate_pdf
    authorize @overheating_tool
    @overheating_tool.schedule_pdf_generation!
    render_success @overheating_tool,
                   "overheating_tool.generate_queued",
                   { blueprint: OverheatingToolBlueprint }
  end

  def download
    authorize @overheating_tool
    render json: { url: @overheating_tool.file_url }, status: :ok
  end

  def update
    authorize @overheating_tool
    if @overheating_tool.update(overheating_tool_params)
      render_success @overheating_tool,
                     nil,
                     { blueprint: OverheatingToolBlueprint }
    else
      render_error "overheating_tool.update_error",
                   {
                     message_opts: {
                       error_message:
                         @overheating_tool.errors.full_messages.join(", ")
                     },
                     status: 422
                   }
    end
  end

  def archive
    authorize @overheating_tool
    if @overheating_tool.discard
      render_success @overheating_tool,
                     nil,
                     { blueprint: OverheatingToolBlueprint }
    else
      render_error "overheating_tool.archive_error",
                   {
                     message_opts: {
                       error_message:
                         @overheating_tool.errors.full_messages.join(", ")
                     },
                     status: 422
                   }
    end
  end

  def restore
    authorize @overheating_tool
    if !@overheating_tool.discarded? || @overheating_tool.undiscard
      render_success @overheating_tool,
                     "overheating_tool.restore_success",
                     { blueprint: OverheatingToolBlueprint }
    else
      render_error "overheating_tool.restore_error"
    end
  end

  private

  def set_overheating_tool
    @overheating_tool = OverheatingTool.find(params[:id])
  end

  def overheating_tool_params
    p = params.require(:overheating_tool)
    permitted =
      p.permit(
        :form_type,
        overheating_documents_attributes: [
          :id,
          :_destroy,
          file: [:id, :storage, metadata: %i[size filename mime_type]]
        ]
      )
    permitted[:form_json] = p[:form_json].permit! if p[:form_json].respond_to?(
      :permit!
    )
    permitted
  end
end
