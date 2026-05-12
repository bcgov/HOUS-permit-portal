class TemplateVersionPreview::ManagementService
  attr_accessor :template_version, :previews, :failed_emails

  def initialize(template_version)
    @template_version = template_version
  end

  def invite_previewers!(emails)
    self.previews = []
    self.failed_emails = []

    emails.each do |email|
      begin
        process_email!(email)
      rescue StandardError => e
        failed_emails << { email: email, error: e.message.truncate(80) }
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
              "activerecord.errors.models.template_version_preview.invalid_email"
            )
    end

    user = find_or_create_user(email)
    template_version_preview =
      assign_previewer!(
        previewer: user,
        template_version: template_version,
        expires_at: 60.days.from_now
      )
    previews << template_version_preview
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
    first_name = name_parts[0]&.capitalize.presence || "Preview"
    last_name = (name_parts[1] || "User").capitalize

    { email: email, first_name: first_name, last_name: last_name }
  end

  # Re-invites intentionally re-send the email so a previewer who lost the
  # original invite can receive it again. We use find_or_create_by! and then
  # unconditionally dispatch the mailer whether the record was just created or
  # already existed.
  def assign_previewer!(previewer:, template_version:, expires_at:)
    template_version_preview =
      template_version
        .template_version_previews
        .find_or_create_by!(previewer: previewer) do |p|
          # TODO: Remove after early-access preview cleanup runs in all envs.
          # db/schema.rb still has this legacy NOT NULL column until final cleanup.
          if p.has_attribute?(:early_access_requirement_template_id)
            p.early_access_requirement_template_id =
              template_version.requirement_template_id
          end
          p.expires_at = expires_at
        end

    send_template_version_preview_email!(template_version_preview)
    template_version_preview
  end

  def send_template_version_preview_email!(template_version_preview)
    user = template_version_preview.previewer
    if user.discarded? || !user.confirmed?
      PermitHubMailer.notify_new_or_unconfirmed_template_version_preview(
        template_version_preview: template_version_preview,
        user: user
      ).deliver_later
    else
      PermitHubMailer.notify_template_version_preview(
        template_version_preview: template_version_preview
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
