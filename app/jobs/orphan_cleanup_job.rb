class OrphanCleanupJob
  include Sidekiq::Worker
  include EnvHelper

  def perform
    # Ensure all models are loaded so PublicRecordable.recordable_models is fully populated.
    # In development/test, Rails uses lazy loading, so models that include PublicRecordable
    # won't register themselves until their class file is loaded.
    Rails.application.eager_load! unless Rails.application.config.eager_load

    # This can be configured via environment variable if needed
    default_days = 1460 # 4 years
    retention_days = integer_env("ORPHAN_DELETE_AFTER_DAYS", default_days)
    cutoff_time = Time.current - retention_days.days

    # Iterate over all models that have registered as PublicRecordable
    PublicRecordable.recordable_models.each do |model|
      cleanup_model(model, cutoff_time)
    end
  end

  private

  def cleanup_model(model, cutoff_time)
    # Account deletion discards the record and sets orphaned_at. Discard's
    # default scope hides those rows, so include them. orphaned_at is the clock.
    scope =
      model.respond_to?(:with_discarded) ? model.with_discarded : model.all
    records_to_delete = scope.where("orphaned_at < ?", cutoff_time)

    records_to_delete.find_each do |record|
      record.destroy!
    rescue => e
      Rails.logger.error(
        "[OrphanCleanupJob] Failed to delete orphaned #{model.name} #{record.id}: #{e.message}"
      )
    end
  end
end
