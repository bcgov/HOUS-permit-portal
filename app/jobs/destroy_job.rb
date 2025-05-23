# app/jobs/destroy_job.rb
class DestroyJob
  include Sidekiq::Worker
  sidekiq_options queue: :default # You can change :default to a specific queue like :shrine

  def perform(attacher_class_name, data)
    attacher_class = Object.const_get(attacher_class_name)
    attacher = attacher_class.from_data(data)

    attacher.destroy
  rescue => e
    # Log errors for debugging
    if defined?(Rails) && Rails.logger
      Rails.logger.error "Shrine DestroyJob: Error destroying attachment: #{e.message}\nBacktrace: #{e.backtrace.join("\n")}"
    end
    raise # Re-raise to allow Sidekiq to handle retries/dead job queue
  end
end
