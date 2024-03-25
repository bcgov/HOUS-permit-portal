class AutomatedCompliance::DigitalSealValidatorJob
  include Sidekiq::Worker
  sidekiq_options queue: :default, lock: :until_and_while_executing

  def perform(permit_application_id)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?
    AutomatedCompliance::DigitalSealValidator.new.call(permit_application)
  end
end
