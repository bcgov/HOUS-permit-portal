class UserMailer < ApplicationMailer
  def send_update_password_success(user)
    send_mail(user, "update_password_success")
  end
end
