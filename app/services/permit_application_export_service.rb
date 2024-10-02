class PermitApplicationExportService
  def initialize()
  end

  def application_metrics_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.application_metrics_csv_headers").split(",")
      jurisdiciton_counts = PermitApplication.count_by_jurisdiction_and_status
      jurisdiciton_counts.each do |jc|
        jurisdiction_name = jc[:name]
        draft = jc[:draft]
        submitted = jc[:submitted]

        csv << [jurisdiction_name, draft, submitted]
      end
    end
  end
end
