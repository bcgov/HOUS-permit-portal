class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  def directory_name
    raise NotImplementedError
  end

  protected

  def send_mail(email:, template:, i18n_key:, i18n_params: {}, locals: {})
    @root_url = FrontendUrlHelper.root_url
    CHESApiWrapper.new.send_email(
      to: email,
      from: ENV["FROM_EMAIL"],
      subject:
        "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{i18n_key}", i18n_params)}",
      body: render(template: template, locals:)
    )
  end
end
