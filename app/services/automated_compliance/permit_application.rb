class AutomatedCompliance::PermitApplication < AutomatedCompliance::Base
  WHITELISTED_ATTRIBUTES =
    AutomatedComplianceConfigurationService.available_module_configurations[
      :PermitApplication
    ][
      :available_fields
    ].map { |field| field[:value] }.freeze

  def call(permit_application)
    return if permit_application.full_address.blank?

    updated = false
    permit_application.with_lock do
      permit_application
        .automated_compliance_requirements_for_module("PermitApplication")
        .each do |field_id, req|
          if WHITELISTED_ATTRIBUTES.include?(
               req.dig("computedCompliance", "value")
             )
            value =
              permit_application.try(req.dig("computedCompliance", "value"))
            if value != permit_application.compliance_data[field_id]
              updated = true
              permit_application.compliance_data[field_id] = value
            end
          end
        end
      permit_application.save! if updated
    end
  end
end
