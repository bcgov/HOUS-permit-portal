module AutomatedComplianceUtils
  extend ActiveSupport::Concern

  def requirements_lookups
    #a flattened list of requiements with the right information, the key is the file field, the rest is the actual requirement hash

    #we utilize this to search by key in special cases like energy stepcode
    #we utilize the lookup to see if the field has computed compliances
    #for electives they will try to lookup and run compliance values regardless in case those do get turned on

    template_version&.lookup_props
  end

  def automated_compliance_requirements
    #check which fields in requirement have custom compliance components
    requirements_lookups.select do |field_id, req|
      req["computedCompliance"].present?
    end
  end

  def automated_compliance_unfilled_requirements
    automated_compliance_requirements.select do |field_id, req|
      submission_field_is_empty?(field_id, req)
    end
  end

  def submission_field_is_empty?(field_id, requirement)
    if requirement.dig("computedCompliance", "module") == "DigitalSealValidator"
      #if there is no related supporting document, consider this okay and not run the autopopulate again
      #if there is a supporting document, check if the compliance has a result, if not, let it know as unfilled
      doc = active_supporting_documents.find_by(data_key: field_id)
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
      .map { |req| req.dig("computedCompliance", "module") }
      .uniq
  end

  def automated_compliance_requirements_for_module(compliance_module_name)
    automated_compliance_requirements.select do |field_id, req|
      req.dig("computedCompliance", "module") == compliance_module_name
    end
  end
end
