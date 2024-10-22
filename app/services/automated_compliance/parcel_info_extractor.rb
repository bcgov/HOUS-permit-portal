class AutomatedCompliance::ParcelInfoExtractor < AutomatedCompliance::Base
  def call(permit_application)
    begin
      if permit_application.pid.blank? && permit_application.pin.blank?
        raise Errors::ParcelError
      end

      # extraction of parcel data can be done via LTSA base
      attributes =
        Wrappers::LtsaParcelMapBc.new.get_feature_attributes_by_pid_or_pin(
          pid: permit_application.pid,
          pin: permit_application.pin
        )

      raise Errors::ParcelError if attributes.nil?

      # automation sets up the extracted data into compliance_data, the front end will allow the user to see what was extracted and override the result
      # lock this while it is updating in case mulitple automated compliances run at once
      permit_application.with_lock do
        updated = false
        permit_application
          .automated_compliance_requirements_for_module("ParcelInfoExtractor")
          .each do |field_id, req|
            value = attributes[req.dig("computedCompliance", "value")]

            if value != permit_application.compliance_data[field_id]
              updated = true
              permit_application.compliance_data[field_id] = value
            end
          end
        permit_application.save! if updated
      end
    rescue Errors::ParcelError
      permit_application.with_lock do
        updated = false
        permit_application
          .automated_compliance_requirements_for_module("ParcelInfoExtractor")
          .each do |field_id, req|
            # set to nil if there is no existing value to indicate
            # a valid value was not found
            if !permit_application.compliance_data.has_key?(field_id)
              updated = true
              permit_application.compliance_data[field_id] = nil
            end
          end
        permit_application.save! if updated
      end
    end
  end
end
