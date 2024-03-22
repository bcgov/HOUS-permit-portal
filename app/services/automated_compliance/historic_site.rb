class AutomatedCompliance::HistoricSite < AutomatedCompliance::Base
  def call(permit_application)
    return if permit_application.pid.blank?
    #extraction of parcel data can be done via LTSA base

    begin
      attributes = Integrations::LtsaParcelMapBc.new.historic_site_by_pid(pid: permit_application.pid)

      permit_application.with_lock do
        permit_application
          .automated_compliance_requirements_for_module("HistoricSite")
          .each do |field_id, req|
            if attributes[req.input_options.dig("computed_compliance", "value")] == "Y"
              permit_application.compliance_data[field_id] = "yes"
            end
          end
        permit_application.save!
      end if attributes
    rescue Errors::GeometryError
      #geometry not found for this pid, null op
      permit_application.with_lock do
        permit_application
          .automated_compliance_requirements_for_module("HistoricSite")
          .each { |field_id, req| permit_application.compliance_data[field_id] = nil }
        permit_application.save!
      end if attributes
    end
  end
end
