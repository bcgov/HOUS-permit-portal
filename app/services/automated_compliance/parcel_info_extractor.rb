class AutomatedCompliance::ParcelInfoExtractor < AutomatedCompliance::Base
  def call(permit_application)
    return if permit_application.pid.blank?
    #extraction of parcel data can be done via LTSA base
    attributes = Integrations::LtsaParcelMapBc.new.get_feature_attributes_by_pid(pid: permit_application.pid)
    updated_submission_data = permit_application.submission_data || { "data" => {} }
    permit_application
      .automated_compliance_requirements_for_module("ParcelInfoExtractor")
      .each do |field_id, req|
        updated_submission_data["data"][field_id] = attributes[req.input_options.dig("computed_compliance", "value")]
      end
    permit_application.update(submission_data: updated_submission_data)
  end
end
