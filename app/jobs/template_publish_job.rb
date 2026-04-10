class TemplatePublishJob
  include Sidekiq::Worker
  sidekiq_options lock: :none

  def perform
    TemplateVersioningService.publish_versions_publishable_now!
  end
end
