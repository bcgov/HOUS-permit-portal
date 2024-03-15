class AutomatedCompliance::ParcelInfoExtractor < AutomatedCompliance::Base
  def call(permit_application)
    return if permit_application.pid.blank?
    #extraction of parcel data can be done via LTSA base
    attributes = Integrations::LtsaParcelMapBc.new.get_feature_attributes_by_pid(pid: permit_application.pid)

    #automation sets up the extracted data into compliance_data, the front end will allow the user to see what was extracted and override the result
    #lock this while it is updating in case mulitple automated compliances run at once
    permit_application.with_lock do
      permit_application
        .automated_compliance_requirements_for_module("ParcelInfoExtractor")
        .each do |field_id, req|
          value = attributes[req.input_options.dig("computed_compliance", "value")]
          permit_application.compliance_data[field_id] = value if value
        end
      permit_application.save!
    end if attributes
  end
end
