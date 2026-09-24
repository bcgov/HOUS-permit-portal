class SubmissionVersion < ApplicationRecord
  audited on: %i[update],
          only: %i[viewed_at],
          associated_with: :permit_application

  include ZipfileUploader.Attachment(:zipfile)

  belongs_to :permit_application
  has_many :revision_requests, dependent: :destroy
  has_many :supporting_documents, dependent: :destroy
  has_many :notes, as: :noteable, dependent: :destroy

  accepts_nested_attributes_for :revision_requests, allow_destroy: true

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
      response_content_disposition:
        ContentDisposition.attachment(zipfile.original_filename)
    )
  end

  def mark_read!
    return if viewed_at.present?

    update!(viewed_at: Time.current)
  end

  def clear_read!
    return if viewed_at.blank?

    update!(viewed_at: nil)
  end

  delegate :permit_project, :sandbox, to: :permit_application

  def applicant_note
    notes.applicant_message.pick(:body)
  end

  def submitter_note
    notes.submitter_message.pick(:body)
  end

  scope :sandboxed,
        -> do
          joins(permit_application: :permit_project).where.not(
            permit_projects: {
              sandbox_id: nil
            }
          )
        end

  scope :live,
        -> do
          joins(permit_application: :permit_project).where(
            permit_projects: {
              sandbox_id: nil
            }
          )
        end

  scope :for_sandbox,
        ->(sandbox) do
          joins(permit_application: :permit_project).where(
            permit_projects: {
              sandbox_id: sandbox.id
            }
          )
        end

  def missing_pdfs
    missing_data_keys = []

    existing_application_pdf =
      supporting_documents.find_by(
        data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY
      )

    if existing_application_pdf.blank? || existing_application_pdf.file.blank?
      missing_data_keys << "#{SupportingDocument::APPLICATION_PDF_DATA_KEY}_#{id}"
    end

    existing_checklist_pdf =
      supporting_documents.find_by(
        data_key: SupportingDocument::CHECKLIST_PDF_DATA_KEY
      )

    if has_step_code_checklist? &&
         (existing_checklist_pdf.blank? || existing_checklist_pdf.file.blank?)
      missing_data_keys << "#{SupportingDocument::CHECKLIST_PDF_DATA_KEY}_#{id}"
    end

    missing_data_keys
  end

  def missing_permit_application_pdf?
    existing_document =
      supporting_documents.find_by(
        data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY
      )

    existing_document.blank? || existing_document.file.blank?
  end

  def missing_step_code_checklist_pdf?
    return false unless has_step_code_checklist?

    existing_document =
      supporting_documents.find_by(
        data_key: SupportingDocument::CHECKLIST_PDF_DATA_KEY
      )

    existing_document.blank? || existing_document.file.blank?
  end

  def has_step_code_checklist?
    step_code_checklist_json.present? && !step_code_checklist_json.empty?
  end

  def missing_pdfs?
    !missing_pdfs.empty?
  end

  def formatted_submission_data(current_user: nil)
    PermitApplication::SubmissionDataService.new(
      permit_application
    ).formatted_submission_data(
      current_user: current_user,
      submission_data: submission_data
    )
  end

  def version_number
    permit_application
      .submission_versions
      .order(:created_at)
      .pluck(:id)
      .index(id) + 1
  end

  def has_request_package_items?
    revision_requests.exists?
  end

  def request_package_visible_to_submitter?
    return true if permit_application.revisions_requested?

    permit_application.latest_submission_version&.id != id
  end

  def revision_requests_for_submitter_based_on_user_permissions(user: nil)
    return revision_requests if user.blank?

    permissions =
      permit_application.submission_requirement_block_edit_permissions(
        user_id: user.id
      )

    return revision_requests if permissions == :all

    return [] if permissions.blank?

    revision_requests.select do |r|
      next true if r.is_a?(SupportingDocumentRevisionRequest)
      if r.requirement_json.blank? || r.requirement_json["key"].blank?
        return false
      end

      rb_id = r.requirement_json["key"][/RB([a-zA-Z0-9\-]+)/, 1]
      permissions.include?(rb_id)
    end
  end
end
