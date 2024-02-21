class AutomatedCompliance::HistoricSite < AutomatedCompliance::Base
  def call(permit_application)
    return if permit_application.pid.blank?
    #extraction of parcel data can be done via LTSA base
    response = Integrations::LtsaParcelMapBc.new.historic_site_by_pid(pid: permit_application.pid)
    if response.success?
      attributes = response.body.dig("features", 0, "attributes")

      if attributes.present?
        updated_submission_data = permit_application.submission_data || { "data" => {} }
        permit_application
          .automated_compliance_requirements_for_module("HistoricSite")
          .each do |field_id, req|
            if attributes[req.input_options.dig("computed_compliance", "value")] == "Y"
              updated_submission_data["data"][field_id] = "Yes"
            end
          end
        permit_application.update(submission_data: updated_submission_data)
      end
    end
  end
end
