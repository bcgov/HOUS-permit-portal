module FormSupportingDocuments
  extend ActiveSupport::Concern
  include TraverseDataJson

  included do
    has_many :supporting_documents, dependent: :destroy
    has_many :active_supporting_documents,
             ->(permit_application) { where(id: permit_application.supporting_doc_ids_from_submission_data) },
             class_name: "SupportingDocument"

    CHECKLIST_PDF_DATA_KEY = :step_code_checklist_pdf
    PERMIT_APP_PDF_DATA_KEY = :permit_application_pdf
    STATIC_DOCUMENT_DATA_KEYS = [PERMIT_APP_PDF_DATA_KEY, CHECKLIST_PDF_DATA_KEY].freeze

    has_many :inactive_supporting_documents,
             ->(permit_application) do
               where
                 .not(id: permit_application.supporting_doc_ids_from_submission_data)
                 .where.not(data_key: STATIC_DOCUMENT_DATA_KEYS)
             end,
             class_name: "SupportingDocument"
    has_many :completed_supporting_documents,
             ->(permit_application) do
               where(id: permit_application.supporting_doc_ids_from_submission_data).or(
                 where(data_key: STATIC_DOCUMENT_DATA_KEYS),
               )
             end,
             class_name: "SupportingDocument"
    accepts_nested_attributes_for :supporting_documents, allow_destroy: true
  end

  def supporting_doc_ids_from_submission_data
    find_file_fields_and_transform!(submission_data, []) do |file_field_key, file_array|
      file_array.map { |fa| fa["model_id"] }
    end
  end

  def formatted_compliance_data
    # compliance data on the permit_applicaiton itself
    joined = compliance_data

    # compliance data for energy step code
    # fetch the energy step_code from json
    if requirement_energy_step_code_key_value && step_code
      if step_code.plan_out_of_date
        joined[requirement_energy_step_code_key_value[0]] = "warningFileOutOfDate"
      else
        joined[requirement_energy_step_code_key_value[0]] = "infoInProgress"
      end
    end

    # data from individual documents
    grouped_compliance_data =
      active_supporting_documents.where.not(compliance_data: {}).map { |sd| sd.compliance_message_view }
    grouped_compliance_data.group_by { |sd| sd["data_key"] }.each { |key, value| joined[key] = value }

    joined
  end

  # for automated compliance fields
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

  def zipfile_size
    zipfile_data&.dig("metadata", "size")
  end

  def zipfile_name
    zipfile_data&.dig("metadata", "filename")
  end

  def zipfile_url
    zipfile&.url(
      public: false,
      expires_in: 3600,
      response_content_disposition: "attachment; filename=\"#{zipfile.original_filename}\"",
    )
  end

  private

  def zip_and_upload_supporting_documents
    return unless submitted? && zipfile_data.blank?

    ZipfileJob.perform_async(id)
  end

  module ClassMethods
    def section_from_key(data_key)
      data_key.split("|")[0].gsub("formSubmissionDataRST", "")
    end
  end
end
