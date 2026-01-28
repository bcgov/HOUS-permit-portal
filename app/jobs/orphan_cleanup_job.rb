class OrphanCleanupJob
  include Sidekiq::Worker
  include EnvHelper

  def perform
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
    # Find orphaned records older than the cutoff time
    # We use orphaned_at to determine when the record was orphaned
    records_to_delete = model.where("orphaned_at < ?", cutoff_time)

    records_to_delete.find_each do |record|
      record.destroy!
    rescue => e
      Rails.logger.error(
        "[OrphanCleanupJob] Failed to delete orphaned #{model.name} #{record.id}: #{e.message}"
      )
    end
  end
end
