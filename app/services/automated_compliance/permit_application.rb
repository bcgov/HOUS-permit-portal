class AutomatedCompliance::PermitApplication < AutomatedCompliance::Base
  WHITELISTED_ATTRIBUTES = ["full_address"]
  def call(permit_application)
    return if permit_application.full_address.blank?

    updated = false
    permit_application
      .automated_compliance_requirements_for_module("PermitApplication")
      .each do |field_id, req|
        if WHITELISTED_ATTRIBUTES.include?(req.input_options.dig("computed_compliance", "value"))
          value = permit_application.try(req.input_options.dig("computed_compliance", "value"))
          if value
            updated = true
            permit_application.compliance_data[field_id] = value
          end
        end
      end
    permit_application.save! if updated
  end
end
