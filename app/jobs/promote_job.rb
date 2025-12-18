# app/jobs/promote_job.rb
class PromoteJob
  include Sidekiq::Worker
  sidekiq_options queue: :default # You can change :default to a specific queue like :shrine

  # System-generated documents that should skip virus scanning
  # These are generated internally and don't come from user uploads
  SKIP_SCAN_DATA_KEYS = %w[
    permit_application_pdf
    step_code_checklist_pdf
  ].freeze

  def perform(
    attacher_class_name,
    record_class_name,
    record_id,
    attachment_name,
    file_data
  )
    attacher_class = Object.const_get(attacher_class_name)
    record_class = Object.const_get(record_class_name)

    record = record_class.find(record_id)

    # Retrieve the attacher instance for the specific record and attachment
    attacher =
      attacher_class.retrieve(
        model: record,
        name: attachment_name.to_sym,
        file: file_data
      )

    # Virus scan gate - scan file before promoting to permanent storage
    scan_file!(attacher, record)

    attacher.atomic_promote # This promotes to store and deletes from cache

    # Mark as clean after successful promotion
    mark_scan_status(record, :clean)
  rescue VirusScanService::InfectedFileError => e
    handle_infected_file(attacher, record, e)
  rescue VirusScanService::NotEnabledError
    # ClamAV not enabled - proceed without scanning
    Rails.logger.info "Shrine PromoteJob: ClamAV not enabled, skipping virus scan for #{record_class_name} ID #{record_id}"
    attacher.atomic_promote
  rescue Shrine::AttachmentChanged, ActiveRecord::RecordNotFound
    # Attachment has changed, or record has been deleted, nothing to do.
    if defined?(Rails) && Rails.logger
      Rails.logger.info "Shrine PromoteJob: Attachment changed or record not found for #{record_class_name} ID #{record_id}, attachment #{attachment_name}. Promotion skipped."
    end
  rescue => e
    # Log other errors for debugging
    if defined?(Rails) && Rails.logger
      Rails.logger.error "Shrine PromoteJob: Error promoting for #{record_class_name} ID #{record_id}, attachment #{attachment_name}: #{e.message}\nBacktrace: #{e.backtrace.join("\n")}"
    end
    raise # Re-raise to allow Sidekiq to handle retries/dead job queue
  end

  private

  def scan_file!(attacher, record)
    return unless should_scan?(record)

    scanner = VirusScanService.new(attacher.file)
    scanner.scan!
  end

  def should_scan?(record)
    # Skip scanning for system-generated files
    if record.respond_to?(:data_key) &&
         SKIP_SCAN_DATA_KEYS.include?(record.data_key)
      return false
    end

    true
  end

  def handle_infected_file(attacher, record, error)
    Rails.logger.error(
      "PromoteJob: Infected file detected for #{record.class.name}##{record.id} - #{error.virus_name}"
    )

    # Capture filename before clearing data
    file_name = record.try(:file_name)

    # Delete the infected file from cache storage
    begin
      attacher.file.delete if attacher.file
    rescue => e
      Rails.logger.error(
        "PromoteJob: Failed to delete infected file from cache: #{e.message}"
      )
    end

    # Update record to reflect infected status and clear file data
    mark_scan_status(record, :infected)
    record.update_columns(file_data: nil) if record.respond_to?(:file_data)

    # Notify the user that their file upload failed
    notify_upload_failed(record, file_name)

    # Don't re-raise - we've handled this case
  end

  def handle_promotion_error(record)
    # Capture filename before clearing data
    file_name = record.try(:file_name)

    # Clear file data since promotion failed
    record.update_columns(file_data: nil) if record.respond_to?(:file_data)

    # Notify the user that their file upload failed
    notify_upload_failed(record, file_name)
  end

  def notify_upload_failed(record, file_name = nil)
    return unless record.is_a?(FileUploadAttachment)

    NotificationService.publish_file_upload_failed_event(
      record,
      file_name: file_name
    )
  rescue => e
    Rails.logger.warn(
      "PromoteJob: Failed to send upload failed notification: #{e.message}"
    )
  end

  def mark_scan_status(record, status)
    return unless record.respond_to?(:scan_status=)

    # Use enum setter - status should be :pending, :clean, or :infected
    record.update_column(:scan_status, status)
  rescue => e
    Rails.logger.warn("PromoteJob: Failed to update scan_status: #{e.message}")
  end
end
