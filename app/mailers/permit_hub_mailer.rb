class PermitHubMailer < ApplicationMailer
  # define instance variables that will be used in the view template
  def welcome(user)
    @user = user
    send_user_mail(email: user.email, template_key: "welcome")
  end

  def onboarding(user)
    @user = user
    send_user_mail(email: user.email, template_key: "onboarding")
  end

  def notify_submitter_application_submitted(user, permit_application)
    @user = user
    @permit_application = permit_application
    send_user_mail(email: user.email, template_key: "notify_submitter_application_submitted")
  end

  def notify_reviewer_application_received(user, permit_application)
    @user = user
    @permit_application = permit_application
    send_user_mail(
      email: user.email,
      template_key: "notify_reviewer_application_received",
      subject_i18n_params: {
        permit_application_number: permit_application.number,
      },
    )
  end

  def notify_application_updated(user, permit_application)
    @user = user
    @permit_application = permit_application
    send_user_mail(
      email: user.email,
      template_key: "notify_application_updated",
      subject_i18n_params: {
        permit_application_number: permit_application.number,
      },
    )
  end

  def remind_reviewer(user, permit_applications)
    @user = user
    @permit_applications = permit_applications
    send_user_mail(email: user.email, template_key: "remind_reviewer")
  end

  #### PermitTypeSubmission Contact Mailer
  def permit_type_submission_contact_confirm(permit_type_submission_contact)
    @permit_type_submission_contact = permit_type_submission_contact
    send_mail(email: permit_type_submission_contact.email, template_key: "permit_type_submission_contact_confirm")
  end

  def send_user_mail(*args, **kwargs)
    return if @user.discarded? || !@user.confirmed?
    send_mail(*args, **kwargs)
  end
end
