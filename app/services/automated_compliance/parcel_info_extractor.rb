class AutomatedCompliance::ParcelInfoExtractor < AutomatedCompliance::Base
  def call(permit_application)
    return if permit_application.pid.blank?
    #extraction of parcel data can be done via LTSA base
    response = Integrations::LtsaParcelMapBc.new.get_details_by_pid(pid: permit_application.pid)
    if response.success?
      #assumes there is one layer to these features at the moment
      attributes = response.body.dig("features", 0, "attributes")

      updated_submission_data = permit_application.submission_data || { "data" => {} }
      permit_application
        .automated_compliance_requirements_for_module("ParcelInfoExtractor")
        .each do |field_id, req|
          updated_submission_data["data"][field_id] = attributes[req.input_options.dig("computed_compliance", "value")]
        end
      permit_application.update(submission_data: updated_submission_data)
    end
  end
end
