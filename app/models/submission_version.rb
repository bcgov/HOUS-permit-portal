class SubmissionVersion < ApplicationRecord
  belongs_to :permit_application
  has_many :revision_requests, dependent: :destroy
  has_many :supporting_documents, dependent: :destroy

  accepts_nested_attributes_for :revision_requests, allow_destroy: true

  after_commit :notify_user_application_viewed

  def missing_pdfs
    missing_data_keys = []

    unless supporting_documents.find_by(data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY).present?
      missing_data_keys << "#{SupportingDocument::APPLICATION_PDF_DATA_KEY}_#{id}"
    end

    unless step_code_checklist_json.empty? ||
             supporting_documents.find_by(data_key: SupportingDocument::CHECKLIST_PDF_DATA_KEY).present?
      missing_data_keys << "#{SupportingDocument::CHECKLIST_PDF_DATA_KEY}_#{id}"
    end

    missing_data_keys
  end

  def missing_pdfs?
    !missing_pdfs.empty?
  end

  def formatted_submission_data(current_user: nil)
    PermitApplication::SubmissionDataService.new(permit_application).formatted_submission_data(
      current_user: current_user,
      submission_data: submission_data,
    )
  end

  def revision_requests_for_submitter_based_on_user_permissions(user: nil)
    return revision_requests if user.blank?

    permissions = permit_application.submission_requirement_block_edit_permissions(user_id: user.id)

    return revision_requests if permissions == :all

    return [] if permissions.blank?

    revision_requests.select do |r|
      return false if r.requirement_json["key"].blank?

      rb_id = r.requirement_json["key"][/RB([a-zA-Z0-9\-]+)/, 1]
      permissions.include?(rb_id)
    end
  end

  def notify_user_application_viewed
    return if new_record?
    viewed_at_change = previous_changes.dig("viewed_at")
    # Check if the `viewed_at` was `nil` before the change and is now not `nil`.
    if (viewed_at_change&.first.nil? && viewed_at_change&.last.present?)
      NotificationService.publish_application_view_event(permit_application)
    end
  end
end
