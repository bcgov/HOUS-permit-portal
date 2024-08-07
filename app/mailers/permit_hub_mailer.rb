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

  def new_jurisdiction_membership(user, jurisdiction_id)
    @user = user
    @jurisdiction = Jurisdiction.find(jurisdiction_id)
    send_user_mail(email: user.email, template_key: "new_jurisdiction_membership")
  end

  def notify_submitter_application_submitted(permit_application)
    @user = permit_application.submitter
    @permit_application = permit_application
    send_user_mail(email: @user.email, template_key: "notify_submitter_application_submitted")
  end

  def notify_integration_mapping(user:, integration_mapping:)
    @user = user
    @template_version = integration_mapping.template_version

    unless integration_mapping.jurisdiction.external_api_enabled? &&
             (@user.review_manager? || @user.regional_review_manager?) &&
             (@template_version.published? || @template_version.scheduled?)
      return
    end

    @front_end_path = integration_mapping.front_end_edit_path

    template_key = "notify_#{@template_version.scheduled? ? "new" : "missing"}_integration_mapping"

    send_user_mail(email: user.email, template_key: template_key)
  end

  def notify_integration_mapping_external(external_api_key:, template_version:)
    @template_version = template_version

    unless external_api_key.notification_email.present? && external_api_key.jurisdiction.external_api_enabled? &&
             (@template_version.published? || @template_version.scheduled?)
      return
    end

    template_key = "notify_#{@template_version.scheduled? ? "new" : "missing"}_integration_mapping"

    @jurisdiction_name = external_api_key.jurisdiction.qualified_name

    send_mail(email: external_api_key.notification_email, template_key: template_key)
  end

  def notify_reviewer_application_received(permit_type_submission_contact, permit_application)
    @permit_application = permit_application
    send_mail(
      email: permit_type_submission_contact.email,
      template_key: "notify_reviewer_application_received",
      subject_i18n_params: {
        permit_application_number: permit_application.number,
      },
    )
  end

  def notify_application_viewed(permit_application)
    @user = permit_application.submitter
    @permit_application = permit_application
    send_user_mail(
      email: @user.email,
      template_key: "notify_application_viewed",
      subject_i18n_params: {
        permit_application_number: permit_application.number,
      },
    )
  end

  def notify_application_revisions_requested(permit_application)
    @user = permit_application.submitter
    @permit_application = permit_application
    send_user_mail(
      email: @user.email,
      template_key: "notify_application_revisions_requested",
      subject_i18n_params: {
        permit_application_number: permit_application.number,
      },
    )
  end

  def remind_reviewer(permit_type_submission_contact, permit_applications)
    @permit_applications = permit_applications
    send_mail(email: permit_type_submission_contact.email, template_key: "remind_reviewer")
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
