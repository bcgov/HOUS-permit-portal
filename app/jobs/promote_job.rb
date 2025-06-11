# app/jobs/promote_job.rb
class PromoteJob
  include Sidekiq::Worker
  sidekiq_options queue: :default # You can change :default to a specific queue like :shrine

  def perform(
    attacher_class_name,
    record_class_name,
    record_id,
    attachment_name,
    file_data
  )
    attacher_class = Object.const_get(attacher_class_name)
    record_class = Object.const_get(record_class_name)

    record = record_class.find(record_id) # Or however you reliably find your record

    # Retrieve the attacher instance for the specific record and attachment
    attacher =
      attacher_class.retrieve(
        model: record,
        name: attachment_name.to_sym, # Ensure name is a symbol
        file: file_data
      )

    attacher.atomic_promote # This promotes to store and deletes from cache
  rescue Shrine::AttachmentChanged, ActiveRecord::RecordNotFound
    # Attachment has changed, or record has been deleted, nothing to do.
    # It's good practice to log this for observability.
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
end
