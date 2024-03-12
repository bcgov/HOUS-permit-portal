class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  protected

  def send_mail(email:, template:, i18n_key:, locals: {})
    CHESApiWrapper.new.send_email(
      to: email,
      from: ENV["FROM_EMAIL"],
      subject: "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{i18n_key}")}",
      body: render(template: template, layout: false, locals:),
    )
  end
end
