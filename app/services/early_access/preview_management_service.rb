class EarlyAccess::PreviewManagementService
  attr_accessor :early_access_requirement_template, :previews, :failed_emails

  def initialize(early_access_requirement_template)
    @early_access_requirement_template = early_access_requirement_template
  end

  def invite_previewers!(emails)
    self.previews = []
    self.failed_emails = []

    emails.each do |email|
      begin
        process_email!(email)
      rescue StandardError => e
        message =
          if e.instance_of?(ActiveRecord::RecordNotUnique)
            I18n.t(
              "activerecord.errors.models.early_access_preview.already_invited"
            )
          else
            e.message.truncate(80)
          end
        failed_emails << { email: email, error: message }
      end
    end

    { previews: previews, failed_emails: failed_emails }
  end

  private

  def process_email!(email)
    email = email.strip
    unless email =~ URI::MailTo::EMAIL_REGEXP
      raise PreviewError,
            I18n.t(
              "activerecord.errors.models.early_access_preview.invalid_email"
            )
    end

    user = find_or_create_user(email)
    early_access_preview =
      assign_previewer!(
        previewer: user,
        early_access_requirement_template: early_access_requirement_template,
        expires_at: 60.days.from_now
      )
    previews << early_access_preview
  end

  def find_or_create_user(email)
    user = User.where(omniauth_email: email).or(User.where(email: email)).first

    return user if user

    user_params = extract_user_params(email)
    create_submission_user!(user_params)
  end

  def extract_user_params(email)
    username = email.split("@").first
    name_parts = username.split(".")
    first_name = name_parts[0].capitalize
    last_name = (name_parts[1] || "<Last Name>").capitalize

    { email: email, first_name: first_name, last_name: last_name }
  end

  def assign_previewer!(
    previewer:,
    early_access_requirement_template:,
    expires_at:
  )
    early_access_preview =
      early_access_requirement_template.early_access_previews.build(
        previewer: previewer,
        expires_at: expires_at
      )
    unless early_access_preview.save
      raise PreviewError, early_access_preview.errors.full_messages.join(", ")
    end

    send_early_access_preview_email!(early_access_preview)
    early_access_preview
  end

  def send_early_access_preview_email!(early_access_preview)
    user = early_access_preview.previewer
    if user.discarded? || !user.confirmed?
      PermitHubMailer.notify_new_or_unconfirmed_preview(
        early_access_preview: early_access_preview,
        user: user
      ).deliver_later
    else
      PermitHubMailer.notify_preview(
        early_access_preview: early_access_preview
      )&.deliver_later
    end
  end

  def create_submission_user!(user_params)
    user =
      User.build(
        first_name: user_params[:first_name],
        last_name: user_params[:last_name],
        email: user_params[:email],
        role: :submitter
      )

    if user.save
      user
    else
      raise PreviewError, user.errors.full_messages.join(", ")
    end
  end
end
