class PermitHubMailer < ApplicationMailer
  def send_welcome_email(user)
    send_mail(user, "welcome")
  end

  def send_notify_submitter_application_submitted_email(user, permit_application)
    @permit_application = permit_application
    send_mail(user, "notify_submitter_application_submitted")
  end

  def send_notify_reviewer_application_received_email(user, permit_application)
    @permit_application = permit_application
    send_mail(user, "notify_reviewer_application_received", { permit_application_number: permit_application.number })
  end

  def send_notify_application_updated_email(user, permit_application)
    @permit_application = permit_application
    send_mail(user, "notify_application_updated", { permit_application_number: permit_application.number })
  end

  def send_remind_reviewer_email(user, permit_applications)
    @permit_applications = permit_applications
    send_mail(user, "remind_reviewer")
  end
end
