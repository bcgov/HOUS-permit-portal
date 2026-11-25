class ReportWarmJob
  include Sidekiq::Worker

  def perform
    Reports::Registry.keys.each do |key|
      Reports::Range::PRESETS.keys.each do |preset|
        Reports::Cache.fetch(key, Reports::Range.parse(preset), force: true)
      end
    end
  end
end
