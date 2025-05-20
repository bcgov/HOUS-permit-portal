class CacheStepCodeMetricsJob
  include Sidekiq::Worker
  sidekiq_options retry: 3 # Optional: Configure retry attempts

  def perform
    Rails.logger.info "Starting CacheStepCodeMetricsJob..."
    total_processed = 0
    total_updated = 0
    start_time = Time.current

    process_step_code_type(Part3StepCode) do |processed, updated|
      total_processed += processed
      total_updated += updated
    end

    process_step_code_type(Part9StepCode) do |processed, updated|
      total_processed += processed
      total_updated += updated
    end

    duration = Time.current - start_time
    Rails.logger.info "CacheStepCodeMetricsJob finished in #{duration.round(2)} seconds."
    Rails.logger.info "Total records processed: #{total_processed}. Total records updated/cached: #{total_updated}."
  end

  private

  def process_step_code_type(model_class)
    model_name = model_class.name
    blueprint_class = model_class.checklist_blueprint # Get blueprint from model class
    Rails.logger.info "Processing #{model_name} for metrics caching using #{blueprint_class.name}..."
    processed_count = 0
    updated_count = 0

    model_class.find_each do |step_code|
      processed_count += 1
      checklist = step_code.primary_checklist

      unless checklist
        Rails.logger.warn "Skipping #{model_name} ID: #{step_code.id} due to missing primary checklist."
        next
      end

      needs_caching = false
      if step_code.metrics_cached_at.nil?
        needs_caching = true
        Rails.logger.info "Recaching #{model_name} ID: #{step_code.id} (never cached)."
      elsif step_code.updated_at > step_code.metrics_cached_at
        needs_caching = true
        Rails.logger.info "Recaching #{model_name} ID: #{step_code.id} (record updated)."
      elsif checklist.updated_at > step_code.metrics_cached_at
        needs_caching = true
        Rails.logger.info "Recaching #{model_name} ID: #{step_code.id} (checklist updated)."
      end

      if needs_caching
        begin
          json_data =
            blueprint_class.render_as_hash(checklist, view: :metrics_export)
          step_code.update_columns(
            cached_metrics_json: json_data,
            metrics_cached_at: Time.current
          )
          updated_count += 1
          Rails.logger.info "Successfully cached metrics for #{model_name} ID: #{step_code.id}."
        rescue => e
          Rails.logger.error "Error caching metrics for #{model_name} ID: #{step_code.id} - #{e.message}\n#{e.backtrace.join("\n")}"
        end
      end
      # Optional: Log if a record was checked but didn't need updating
      # else
      #   Rails.logger.debug "Metrics for #{model_name} ID: #{step_code.id} are up to date."
      # end
    end

    Rails.logger.info "Finished processing #{model_name}. Processed: #{processed_count}, Updated: #{updated_count}."
    yield(processed_count, updated_count) if block_given?
  end
end
