class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  protected

  # template_key should match i18n as well as the name of the file in the views
  def send_mail(email:, template_key:, subject_i18n_params: {})
    @root_url = FrontendUrlHelper.root_url

    mail(
      to: email,
      subject:
        "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{template_key}", **subject_i18n_params)}",
      template_name: template_key # this isn't fully necessary since rails introspects it anyway, but here for clarity (template_path is also auto introspected by rails)
    )
  end
end
