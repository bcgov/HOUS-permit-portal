class Api::ReportsController < Api::ApplicationController
  skip_after_action :verify_policy_scoped

  def index
    authorize :report, :index?
    render_success Reports::Registry.summaries
  end

  def show
    authorize :report, :show?
    return render_unknown_report unless registered?

    render_success Reports::Cache.fetch(params[:key], report_range)
  end

  def refresh
    authorize :report, :refresh?
    return render_unknown_report unless registered?

    payload = Reports::Cache.fetch(params[:key], report_range, force: true)
    if payload.with_indifferent_access[:refresh_failed]
      render_error "report.refresh_error"
    else
      render_success payload, "report.refresh_success"
    end
  end

  def export
    authorize :report, :export?
    return render_unknown_report unless registered?

    report = Reports::Registry.build(params[:key], report_range)
    payload = Reports::Cache.fetch(params[:key], report_range)
    send_data report.csv_from_payload(payload),
              type: "text/csv",
              filename: report.export_filename
  end

  private

  def registered?
    Reports::Registry.registered?(params[:key])
  end

  def report_range
    Reports::Range.parse(params[:range])
  end

  def render_unknown_report
    render_error "report.not_found_error", { status: :not_found }
  end
end
