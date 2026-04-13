class TemplatePublishJob
  include Sidekiq::Worker

  def perform
    TemplateVersioningService.publish_versions_publishable_now!
  end
end
