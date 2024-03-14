class PermitHubMailerJob
  include Sidekiq::Worker
  sidekiq_options queue: :mailers

  def perform(email_type, user_id, permit_application_id = nil)
    user = User.find(user_id)
    permit_application = PermitApplication.find(permit_application_id) if permit_application_id.present?

    case email_type
    when "welcome"
      PermitHubMailer.new.send_welcome_email(user)
    when "onboarding"
      PermitHubMailer.new.send_onboarding_email(user)
    when "notify_submitter_application_submitted"
      PermitHubMailer.new.send_notify_submitter_application_submitted_email(user, permit_application)
    when "notify_reviewer_application_received"
      PermitHubMailer.new.send_notify_reviewer_application_received_email(user, permit_application)
    when "notify_application_updated"
      PermitHubMailer.new.send_notify_application_updated_email(user, permit_application)
    end
  end
end
