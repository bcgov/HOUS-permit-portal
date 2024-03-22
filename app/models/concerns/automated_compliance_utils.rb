module AutomatedComplianceUtils
  extend ActiveSupport::Concern

  def requirements_lookups #a flattened list of requiements with the right information
    # template_version&.lookup_props
    template_version&.requirement_template&.lookup_props
  end

  def automated_compliance_requirements
    #check which fields in requirement have custom compliance components
    requirements_lookups.select { |field_id, req| req.computed_compliance? }
  end

  def automated_compliance_unfilled_requirements
    automated_compliance_requirements.select { |field_id, req| submission_field_is_empty?(field_id, req) }
  end

  def submission_field_is_empty?(field_id, requirement)
    if requirement.input_options.dig("computed_compliance", "module") == "DigitalSealValidator"
      #if there is no related supporting document, consider this okay and not run the autopopulate again
      #if there is a supporting document, check if the compliance has a result, if not, let it know as unfilled
      doc = supporting_documents.find_by(data_key: field_id)
      doc.present? ? doc.compliance_data.empty? : false

      #ALTERNATIVELY search submssion data itself, identify fields with values and loop through
      # supporting_documents
      #   .find_by_id(submission_data.dig("data", field_id, "id"))
      #   &.compliance_data
      #   .blank?
    else
      compliance_data.dig(field_id).blank?
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
