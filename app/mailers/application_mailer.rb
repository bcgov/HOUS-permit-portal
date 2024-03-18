class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  protected

  def send_mail(user, action, subject_i18n_values = {})
    @user = user
    @root_url = FrontendUrlHelper.root_url

    mail(
      to: user.email,
      # from: ENV['FROM_EMAIL']
      subject:
        "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{action}", **subject_i18n_values)}",
      body: render(template: "#{self.class.name.underscore}/#{action}"),
    )
  end
end
