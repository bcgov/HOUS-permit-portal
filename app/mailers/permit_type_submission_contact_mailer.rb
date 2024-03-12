class PermitTypeSubmissionContactMailer < ApplicationMailer
  def send_confirm_email(contact)
    send_mail(
      email: contact.email,
      template: "permit_type_submission_contact_mailer/confirm_email",
      i18n_key: "confirm_inbox_email",
      locals: {
        permit_type: contact.permit_type.name,
        email: contact.email,
        confirmation_url:
          permit_type_submission_contact_confirmation_url(confirmation_token: contact.confirmation_token),
      },
    )
  end
end
