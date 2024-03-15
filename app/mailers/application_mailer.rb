class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  def directory_name
    raise NotImplementedError
  end

  protected

  def send_mail(user, action, subject_i18n_values = {})
    @user = user
    @root_url = FrontendUrlHelper.root_url

    CHESApiWrapper.new.send_email(
      to: user.email,
      from: ENV["FROM_EMAIL"],
      subject:
        "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{action}", **subject_i18n_values)}",
      body: render(template: "#{self.class.name.underscore}/#{action}"),
    )
  end
end
