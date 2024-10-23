class PermitApplicationExportService
  def initialize()
  end

  def application_metrics_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.application_metrics_csv_headers").split(",")
      jurisdiciton_counts =
        PermitApplication.stats_by_template_jurisdiction_and_status
      jurisdiciton_counts.each do |jc|
        jurisdiction_name = jc[:jurisdiction_name]
        permit_type = jc[:permit_type]
        activity = jc[:activity]
        first_nations = jc[:first_nations]
        draft_applications = jc[:draft_applications]
        submitted_applications = jc[:submitted_applications]
        # 86400 seconds in a day
        average_days_spent_before_first_submit =
          (jc[:average_time_spent_before_first_submit] / 86400.0).round(2)
        average_days_spent_before_latest_submit =
          (jc[:average_time_spent_before_latest_submit] / 86400.0).round(2)

        csv << [
          jurisdiction_name,
          permit_type,
          activity,
          first_nations,
          draft_applications,
          submitted_applications,
          average_days_spent_before_first_submit,
          average_days_spent_before_latest_submit
        ]
      end
    end
  end
end
