module Api::Concerns::FormSupportingDocuments
  extend ActiveSupport::Concern
  include TraverseDataJson
  #based on params of files changed, prepare to know which file updates need to be reupdated to user

  def extract_s3_uploads_from_params(params_permitted)
    @mapped_attributes =
      find_file_fields_and_transform!(params_permitted[:submission_data].to_h, []) do |file_field_key, file_array|
        file_array.map { |file| remap_attributes_for_create(file_field_key, file) }.compact
      end

    if @mapped_attributes.present?
      params_permitted.merge(supporting_documents_attributes: @mapped_attributes)
    else
      params_permitted
    end
  end

  def remap_attributes_for_create(file_field_key, file_hash) #assume hash has id and storage
    #do nothing if already in s3 custom
    return if file_hash["storage"] != "s3custom" || !file_hash["id"].start_with?("cache/")
    #do nothing if a file already exists
    return if !@permit_application.supporting_documents.file_ids_with_regex("#{file_hash["id"].slice(6..-1)}$").empty?
    file_hash.tap do |h|
      h["storage"] = "cache"
      h["id"] = h["id"].slice(6..-1)
    end
    { "file" => file_hash, "data_key" => file_field_key }
  end
end
