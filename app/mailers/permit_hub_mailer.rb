class PermitHubMailer < ApplicationMailer
  def send_welcome_email(user)
    send_mail(
      email: user.email,
      template: "user_mailer/welcome",
      i18n_key: "welcome",
      locals: {
        user:
      }
    )
  end

  def send_onboarding_email(user)
    send_mail(
      email: user.email,
      template: "user_mailer/onboarding",
      i18n_key: "onboarding",
      locals: {
        user:
      }
    )
  end

  def send_notify_submitter_application_submitted_email(
    user,
    permit_application
  )
    send_mail(
      email: user.email,
      template: "user_mailer/notify_submitter_application_submitted",
      i18n_key: "notify_submitter_application_submitted",
      locals: {
        user:,
        permit_application:
      }
    )
  end

  def send_notify_reviewer_application_received_email(user, permit_application)
    send_mail(
      email: user.email,
      template: "user_mailer/notify_reviewer_application_received",
      i18n_key: "notify_reviewer_application_received",
      i18n_params: {
        permit_application_number: permit_application.number
      },
      locals: {
        user:,
        permit_application:
      }
    )
  end

  def send_notify_application_updated_email(user, permit_application)
    send_mail(
      email: user.email,
      template: "user_mailer/notify_application_updated",
      i18n_key: "notify_application_updated",
      i18n_params: {
        permit_application_number: permit_application.number
      },
      locals: {
        user:,
        permit_application:
      }
    )
  end

  def send_remind_reviewer_email(user, permit_applications)
    send_mail(
      email: user.email,
      template: "user_mailer/remind_reviewer",
      i18n_key: "remind_reviewer",
      locals: {
        user:,
        permit_applications:
      }
    )
  end
end
