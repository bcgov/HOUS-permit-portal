class Api::ReportsController < Api::ApplicationController
  skip_after_action :verify_policy_scoped

  def index
    authorize :report, :index?
    render json: { data: Reports::Registry.summaries }
  end

  def show
    authorize :report, :show?
    unless Reports::Registry.registered?(params[:key])
      return render_unknown_report
    end

    payload = Reports::Cache.fetch(params[:key], report_range)
    render json: { data: payload }
  end

  private

  def report_range
    Reports::Range.parse(params[:range])
  end

  def render_unknown_report
    render_error "report.not_found_error", { status: :not_found }
  end
end
