class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  protected

  # template_key should match i18n as well as the name of the file in the views
  # subject_key can be provided to use a different i18n key for the subject line
  def send_mail(
    email:,
    template_key:,
    subject_i18n_params: {},
    subject_key: nil
  )
    @root_url = FrontendUrlHelper.root_url

    resolved_subject_key = subject_key || template_key

    mail(
      to: email,
      subject:
        "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{resolved_subject_key}", **subject_i18n_params)}",
      template_name: template_key
    )
  end
end
