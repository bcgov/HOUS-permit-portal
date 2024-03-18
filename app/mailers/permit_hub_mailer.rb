class PermitHubMailer < ApplicationMailer
  def welcome(user)
    send_mail(user, "welcome")
  end

  def onboarding(user)
    send_mail(user, "onboarding")
  end

  def notify_submitter_application_submitted(user, permit_application)
    @permit_application = permit_application
    send_mail(user, "notify_submitter_application_submitted")
  end

  def notify_reviewer_application_received(user, permit_application)
    @permit_application = permit_application
    send_mail(user, "notify_reviewer_application_received", { permit_application_number: permit_application.number })
  end

  def notify_application_updated(user, permit_application)
    @permit_application = permit_application
    send_mail(user, "notify_application_updated", { permit_application_number: permit_application.number })
  end

  def remind_reviewer(user, permit_applications)
    @permit_applications = permit_applications
    send_mail(user, "remind_reviewer")
  end
end
