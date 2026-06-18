class Api::TemplateVersionFeedbacksController < Api::ApplicationController
  before_action :set_template_version
  before_action :set_feedback, only: %i[resolve unresolve]

  def index
    authorize @template_version, :show?

    feedbacks =
      @template_version
        .template_version_feedbacks
        .includes(:user, :resolved_by)
        .order(created_at: :desc)

    render_success feedbacks,
                   nil,
                   { blueprint: TemplateVersionFeedbackBlueprint }
  end

  def create
    authorize @template_version, :show?

    begin
      feedback =
        TemplateVersionFeedbackService.create_feedback!(
          @template_version,
          user: current_user,
          body: feedback_params[:body],
          sentiment: feedback_params[:sentiment] || :comment
        )

      render_success feedback,
                     "template_version_feedback.create_success",
                     { blueprint: TemplateVersionFeedbackBlueprint }
    rescue TemplateVersionDraftError => e
      render_error "template_version_feedback.create_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def resolve
    authorize @template_version, :update?

    TemplateVersionFeedbackService.resolve_feedback!(
      @feedback,
      resolver: current_user
    )

    render_success @feedback,
                   "template_version_feedback.resolve_success",
                   { blueprint: TemplateVersionFeedbackBlueprint }
  end

  def unresolve
    authorize @template_version, :update?

    TemplateVersionFeedbackService.unresolve_feedback!(@feedback)

    render_success @feedback,
                   "template_version_feedback.unresolve_success",
                   { blueprint: TemplateVersionFeedbackBlueprint }
  end

  private

  def set_template_version
    @template_version = TemplateVersion.find(params[:template_version_id])
  end

  def set_feedback
    @feedback = TemplateVersionFeedback.find(params[:id])
  end

  def feedback_params
    params.permit(:body, :sentiment)
  end
end
