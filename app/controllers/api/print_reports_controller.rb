# Read-only inputs for HTML reports. Deliberately independent of generation jobs.
class Api::PrintReportsController < Api::ApplicationController
  before_action :require_preview_mode!
  around_action :prevent_report_writes

  def application
    application = PermitApplication.find(params[:id])
    authorize application, :show?
    render json: {
             data:
               PrintReports::Data.new(current_user).application(
                 application,
                 params[:submission_version_id]
               )
           }
  end

  def application_step_code
    application = PermitApplication.find(params[:id])
    authorize application, :show?
    # Application access alone must not disclose another collaborator's checklist.
    raise ActiveRecord::RecordNotFound unless application.step_code
    authorize application.step_code, :show?
    render json: {
             data:
               PrintReports::Data.new(current_user).application_step_code(
                 application,
                 params[:submission_version_id]
               )
           }
  end

  def part3
    step_code = Part3StepCode.find(params[:id])
    authorize step_code, :show?
    render json: {
             data:
               PrintReports::Data.new(current_user).step_code(
                 step_code,
                 params[:checklist_id]
               )
           }
  end

  def part9
    step_code = Part9StepCode.find(params[:id])
    authorize step_code, :show?
    render json: {
             data:
               PrintReports::Data.new(current_user).step_code(
                 step_code,
                 params[:checklist_id]
               )
           }
  end

  rescue_from PrintReports::Data::Unavailable do |error|
    render json: { error: error.message }, status: :not_found
  end

  rescue_from ActiveRecord::RecordNotFound do
    skip_authorization
    render json: {
             error: "The requested report or saved snapshot is unavailable."
           },
           status: :not_found
  end

  private

  def prevent_report_writes(&action)
    ActiveRecord::Base.while_preventing_writes(&action)
  end

  def require_preview_mode!
    if Rails.env.development? ||
         (ENV["VITE_QA_MODE"] == "true" && SiteConfiguration.qa_tools_enabled?)
      return
    end
    skip_authorization
    head :not_found
  end
end
