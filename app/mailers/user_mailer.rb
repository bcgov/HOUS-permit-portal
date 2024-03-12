class UserMailer < ApplicationMailer
  def send_update_password_success(user)
    send_mail(email: user.email, template: "user_mailer/update_password_success", i18n_key: "update_password_success")
  end
end
