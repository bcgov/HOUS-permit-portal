class ApplicationMailer < ActionMailer::Base
  default from: ENV["FROM_EMAIL"]
  layout "mailer"

  protected

  def send_mail(user, action)
    CHESApiWrapper.new.send_email(
      to: user.email,
      from: ENV["FROM_EMAIL"],
      subject: "#{I18n.t("application_mailer.subject_start")} - #{I18n.t("application_mailer.subjects.#{action}")}",
      body: render(template: "user_mailer/#{action}", layout: false),
    )
  end
end
