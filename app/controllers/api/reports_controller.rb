class Api::ReportsController < Api::ApplicationController
  skip_after_action :verify_policy_scoped

  def index
    authorize :report, :index?
    render json: { data: Reports::Registry.summaries }
  end

  def show
    authorize :report, :show?
    return render_unknown_report unless registered?

    render json: { data: Reports::Cache.fetch(params[:key], report_range) }
  end

  def refresh
    authorize :report, :refresh?
    return render_unknown_report unless registered?

    payload = Reports::Cache.fetch(params[:key], report_range, force: true)
    failed = payload[:refresh_failed] || payload["refresh_failed"]
    render json: {
             data: payload,
             meta: {
               message:
                 ArbitraryMessageConstruct.message(
                   key:
                     (
                       if failed
                         "report.refresh_error"
                       else
                         "report.refresh_success"
                       end
                     ),
                   type: failed ? "error" : "success"
                 )
             }
           }
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
