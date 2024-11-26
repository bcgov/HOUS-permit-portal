class AutomatedCompliance::HistoricSite < AutomatedCompliance::Base
  def call(permit_application)
    begin
      raise Errors::GeometryError if permit_application.pid.blank?

      # extraction of parcel data can be done via LTSA base
      attributes =
        Wrappers::LtsaParcelMapBc.new.historic_site_by_pid(
          pid: permit_application.pid
        )

      raise Errors::GeometryError if attributes.nil?

      permit_application.with_lock do
        updated = false
        permit_application
          .automated_compliance_requirements_for_module("HistoricSite")
          .each do |field_id, req|
            attribute_value = attributes[req.dig("computedCompliance", "value")]

            options_map = req.dig("computedCompliance", "optionsMap")

            result =
              if options_map.present? && options_map.is_a?(Hash)
                # set to configured requirement option value
                options_map[attribute_value]
              elsif attribute_value == "Y" # this is for backward compatibility when options_map wasn't implemented
                "yes"
              elsif attribute_value == "N" # this is for backward compatibility when options_map wasn't implemented
                "no"
              else
                # set to nil to indicate a valid value was not found
                nil
              end
            if result != permit_application.compliance_data[field_id]
              updated = true
              permit_application.compliance_data[field_id] = result
            end
          end
        permit_application.save! if updated
      end if attributes
    rescue Errors::GeometryError
      # geometry not found for this pid or pid blank, null op
      permit_application.with_lock do
        updated = false
        permit_application
          .automated_compliance_requirements_for_module("HistoricSite")
          .each do |field_id, req|
            if !permit_application.compliance_data.has_key?(field_id)
              updated = true
              # set to nil if there is no existing value to indicate
              # a valid value was not found
              permit_application.compliance_data[field_id] = nil
            end
          end
        permit_application.save! if updated
      end
    end
  end
end
