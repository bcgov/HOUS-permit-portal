module AutomatedComplianceUtils
  extend ActiveSupport::Concern

  #placheholder, will be removed once lookup_props is refactored
  def published_requirement_template
    RequirementTemplate.find_by(activity: activity, permit_type: permit_type)
  end

  def requirements_lookups
    published_requirement_template&.lookup_props || {}
  end

  def automated_compliance_requirements
    #check which fields in requirement have custom compliance components
    requirements_lookups.select { |field_id, req| req.computed_compliance? }
  end

  def automated_compliance_unfilled_requirements
    automated_compliance_requirements.select do |field_id, req|
      #TODO: if it is a file field, we check the compliance_data value is set instead
      submission_field_is_empty?(field_id, req)
    end
  end

  def submission_field_is_empty?(field_id, requirement)
    return true if submission_data.blank?
    if requirement.input_options.dig("computed_compliance", "value_on")
      supporting_documents.find_by_id(submission_data.dig("data", field_id, "id"))&.compliance_data.blank?
    else
      submission_data.dig("data", field_id).blank?
    end
  end

  def automated_compliance_unique_unfilled_modules
    automated_compliance_unfilled_requirements
      .values
      .map { |req| req.input_options.dig("computed_compliance", "module") }
      .uniq
  end

  def automated_compliance_requirements_for_module(compliance_module_name)
    automated_compliance_requirements.select do |field_id, req|
      req.input_options.dig("computed_compliance", "module") == compliance_module_name
    end
  end
end
