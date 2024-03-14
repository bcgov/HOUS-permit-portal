class CustomDeviseMailer < Devise::Mailer
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  # If you wanted to override devise confirmation instructions do it here
  def confirmation_instructions(record, token, opts = {})
    super
  end

  # Override the method used to send emails so we can use CHES
  def devise_mail(record, action, opts = {}, &block)
    initialize_from_record(record)
    mail_headers = headers_for(action, opts)

    CHESApiWrapper.new.send_email(
      to: mail_headers[:to],
      from: mail_headers[:from],
      subject: "#{I18n.t("application_mailer.subject_start")} - #{mail_headers[:subject]}",
      body: render(template: "devise/mailer/#{mail_headers[:template_name]}"),
    )
  end
end
