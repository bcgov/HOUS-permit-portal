module FormSupportingDocuments
  extend ActiveSupport::Concern
  include TraverseDataJson

  def formatted_compliance_data
    joined = {}
    #compliance data on the permit_applicaiton itself

    #data from individual documents
    grouped_compliance_data =
      supporting_documents
        .where.not(compliance_data: {})
        .map do |sd|
          {
            "data_key" => sd.data_key,
            "message" =>
              sd.compliance_data["error"] ||
                sd.compliance_data["result"].map do |signer|
                  "#{signer["signatureFieldName"]} signed at #{signer.dig("signatureTimestamp", "date")}"
                end,
          }
        end
    grouped_compliance_data
      .group_by { |sd| sd["data_key"] }
      .each { |key, value| joined[key] = value.map { |v| v["message"] }.uniq.join(",") }

    joined
  end

  def update_and_respond_with_backend_changes(params)
    update(params)
    #shrine runs the conversion from cache to storage after commit, deal with this case upon identification of a match of existing files

    assign_attributes(front_end_form_update: file_fields_to_merge) #remaps all ids to not use the cache/ format and goes to the permanetn storage format
    save #save the result (submission data changes)
    return true
  end

  def file_fields_to_merge #NOTE THIS MODIFIES THE UNDERLYING FIELDS TO BE MERGED ON THE SUBMISSION_DATA HASH
    #find supporting docs that are created that have data key and match based on storage id
    docs_in_storage = supporting_documents.select(:id, :data_key, :file_data)
    find_file_fields_and_transform_hash(submission_data, {}) do |file_field_key, file_array|
      file_array.map { |file| remap_cache_to_storage_ids(file_field_key, file, docs_in_storage) }.compact
    end
  end

  def remap_cache_to_storage_ids(file_field_key, file_hash, docs_in_storage)
    if file_hash["storage"] != "s3custom" || !file_hash["id"].start_with?("cache/")
      file_hash
    else
      file_hash.tap do |h|
        support_doc = docs_in_storage.find { |d| d.id && d.data_key == file_field_key }
        file_data_id = support_doc&.file_data&.dig("id")
        if file_data_id.present?
          h["id"] = file_data_id
          h["model"] = "SupportingDocument"
          h["model_id"] = support_doc.id
        end
      end
    end
  end

  #for automated compliance fields
  def fetch_file_ids_from_submission_data_matching_requirements(fields_and_requirements_array)
    fields_and_requirements_array
      .map do |field_id, req|
        self.submission_data.dig("data", PermitApplication.section_from_key(field_id), field_id, 0, "id")
      end
      .compact
      .map { |id| id.start_with?("cache/") ? id.slice(6..-1) : id }
  end

  def supporting_documents_without_compliance_matching(regex_pattern)
    supporting_documents.file_ids_with_regex(regex_pattern).without_compliance
  end

  module ClassMethods
    def section_from_key(data_key)
      data_key.split("|")[0].gsub("formSubmissionDataRST", "")
    end
  end
end
