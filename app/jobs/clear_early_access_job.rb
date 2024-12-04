class ClearEarlyAccessJob
  include Sidekiq::Worker

  def perform()
    #early access elements last for no more than 6 hours (session timeout)

    #Any Step Codes that have no permit_application or creator_id will be discarded (they have a session_id)
    StepCode
      .where(permit_application: nil)
      .where("created_at < ?", 6.hours.ago)
      .destroy_all
  end
end
