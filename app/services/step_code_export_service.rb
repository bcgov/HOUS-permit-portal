class StepCodeExportService
  def summary_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.step_code_summary_csv_headers").split(",")
      jurisdictions = Jurisdiction.all
      permit_types = PermitType.all
      activities = Activity.all

      jurisdictions.each do |j|
        permit_types.each do |pt|
          activities.each do |a|
            jurisdiction_name = j.qualified_name
            permit_type = pt.name
            work_type = a.name
            energy_step_required = j.energy_step_required(a, pt)
            zero_carbon_step_required = j.zero_carbon_step_required(a, pt)
            enabled = energy_step_required.positive? || zero_carbon_step_required.positive?

            csv << [jurisdiction_name, permit_type, work_type, enabled, energy_step_required, zero_carbon_step_required]
          end
        end
      end
    end
  end
end
