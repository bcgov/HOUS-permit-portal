class CustomDeviseMailer < Devise::Mailer
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  # If you wanted to override devise confirmation instructions do it here
  def confirmation_instructions(record, token, opts = {})
    @change_type = record.email.present? ? "changed" : "created"
    @user = record
    super
  end

  def devise_mail(record, action, opts = {}, &block)
    initialize_from_record(record)
    mail_headers = headers_for(action, opts)
    @root_url = FrontendUrlHelper.root_url

    mail(
      to: mail_headers[:to],
      from: mail_headers[:from],
      subject:
        "#{I18n.t("application_mailer.subject_start")} - #{mail_headers[:subject]}",
      template_path: "devise/mailer",
      template_name: mail_headers[:template_name]
    )
  end
end
