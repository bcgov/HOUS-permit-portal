class PermitHubMailer < ApplicationMailer
  # define instance variables that will be used in the view template
  def welcome(user)
    @user = user
    send_user_mail(email: user.email, template_key: "welcome")
  end

  # Sent only when a user archives (discards) their own account.
  # NOTE: This must bypass send_user_mail because the user is discarded at send-time.
  def account_closed(user)
    @user = user
    send_mail(email: user.email, template_key: "account_closed")
  end

  def notify_user_archive_warning(user, days_until_archive)
    @user = user
    @days_until_archive = days_until_archive
    @retention_days = user_delete_after_days
    @scheduled_action = "archiving"
    @scheduled_date = Time.current + days_until_archive.days
    @login_type = login_type_label(user)
    @login_identifier = login_identifier(user)
    send_user_mail(
      email: user.email,
      template_key: "user_archive_warning",
      subject_i18n_params: {
        days: days_until_archive
      }
    )
  end

  def notify_user_delete_warning(user, days_until_delete)
    @user = user
    @days_until_delete = days_until_delete
    @scheduled_action = "deletion"
    @scheduled_date = Time.current + days_until_delete.days
    @login_type = login_type_label(user)
    @login_identifier = login_identifier(user)
    send_mail(
      email: user.email,
      template_key: "user_delete_warning",
      subject_i18n_params: {
        days: days_until_delete
      }
    )
  end

  def onboarding(user)
    @user = user
    send_user_mail(email: user.email, template_key: "onboarding")
  end

  def new_jurisdiction_membership(user, jurisdiction_id)
    @user = user
    @jurisdiction = Jurisdiction.find(jurisdiction_id)
    send_user_mail(
      email: user.email,
      template_key: "new_jurisdiction_membership"
    )
  end

  def notify_submitter_application_submitted(permit_application, user)
    @user = user
    @permit_application = permit_application

    send_user_mail(
      email: @user.email,
      template_key: "notify_submitter_application_submitted"
    )
  end

  def notify_permit_collaboration(permit_collaboration:)
    @permit_collaboration = permit_collaboration
    @user = permit_collaboration.collaborator.user

    return unless permit_collaboration.permit_application
    return unless @user.preference&.enable_email_collaboration_notification

    send_user_mail(
      email: @user.email,
      template_key: :notify_permit_collaboration
    )
  end

  def notify_project_review_collaboration(permit_project_collaboration:)
    @permit_project_collaboration = permit_project_collaboration
    @user = permit_project_collaboration.collaborator.user
    @permit_project = permit_project_collaboration.permit_project

    return unless @user.preference&.enable_email_collaboration_notification

    send_user_mail(
      email: @user.email,
      template_key: :notify_project_review_collaboration
    )
  end

  def notify_preview(early_access_preview:)
    @early_access_preview = early_access_preview
    @user = early_access_preview.previewer

    send_user_mail(email: @user.email, template_key: :notify_preview)
  end

  def notify_block_status_ready(permit_block_status:, user:, status_set_by: nil)
    @permit_block_status = permit_block_status
    @user = user
    @status_set_by = status_set_by

    unless permit_block_status.block_exists? &&
             @user.preference&.enable_email_collaboration_notification
      return
    end

    send_user_mail(email: @user.email, template_key: :notify_block_status_ready)
  end

  def notify_block_status_ready_summary(
    permit_application:,
    user:,
    collaboration_type:,
    requirement_block_names:
  )
    @permit_application = permit_application
    @user = user
    @collaboration_type = collaboration_type
    @requirement_block_names = requirement_block_names
    @requirement_block_count = requirement_block_names.size

    send_user_mail(
      email: @user.email,
      template_key: :notify_block_status_ready_summary
    )
  end

  def notify_new_or_unconfirmed_permit_collaboration(
    permit_collaboration:,
    user:
  )
    @permit_collaboration = permit_collaboration
    @user = user

    return unless @permit_collaboration.permit_application

    if !@user.discarded? && @user.submitter?
      @user.skip_confirmation_notification!
      @user.skip_invitation = true
      @user.invite!(@permit_collaboration.collaborator.collaboratorable)
      @user.invitation_sent_at = Time.now

      @user.save!
    end

    send_mail(
      email: @user.email,
      template_key: :notify_new_or_unconfirmed_permit_collaboration
    )
  end

  def notify_new_or_unconfirmed_preview(early_access_preview:, user:)
    @early_access_preview = early_access_preview
    @user = user

    return unless @early_access_preview.template_version

    if !@user.discarded? && @user.submitter?
      @user.skip_confirmation_notification!
      @user.skip_invitation = true
      @user.invite!
      @user.invitation_sent_at = Time.now

      @user.save!
    end

    send_mail(
      email: @user.email,
      template_key: :notify_new_or_unconfirmed_preview
    )
  end

  def notify_reviewer_application_received(
    permit_type_submission_contact,
    permit_application
  )
    @permit_application = permit_application
    send_mail(
      email: permit_type_submission_contact.email,
      template_key: "notify_reviewer_application_received",
      subject_i18n_params: {
        permit_application_number: permit_application.number
      }
    )
  end

  def notify_review_started(permit_application)
    @user = permit_application.submitter
    @permit_application = permit_application
    send_user_mail(
      email: @user.email,
      template_key: "notify_review_started",
      subject_i18n_params: {
        permit_application_number: permit_application.number
      }
    )
  end

  def notify_application_revisions_requested(permit_application, user)
    @user = user
    @permit_application = permit_application
    send_user_mail(
      email: @user.email,
      template_key: "notify_application_revisions_requested",
      subject_i18n_params: {
        permit_application_number: permit_application.number
      }
    )
  end

  def notify_pre_check_submitted(pre_check)
    @pre_check = pre_check
    @user = pre_check.creator

    send_user_mail(
      email: @user.email,
      template_key: "notify_pre_check_submitted"
    )
  end

  def notify_pre_check_completed(pre_check)
    @pre_check = pre_check
    @user = pre_check.creator

    send_user_mail(
      email: @user.email,
      template_key: "notify_pre_check_completed"
    )
  end

  def notify_new_template_version_published(
    template_version,
    user,
    jurisdiction: nil,
    change_type: :no_action,
    diff_summary: nil
  )
    @template_version = template_version
    @user = user
    @jurisdiction = jurisdiction
    @change_type = change_type
    @diff_summary = diff_summary
    @api_enabled = @jurisdiction.present? && @jurisdiction.external_api_enabled?

    if @api_enabled
      @api_mapping_url =
        FrontendUrlHelper.frontend_url(
          "/jurisdictions/#{@jurisdiction.slug}/api-settings/api-mappings"
        )
    end

    set_submission_inbox_action_required

    subject_key = template_version_subject_key(change_type)

    send_user_mail(
      email: @user.email,
      template_key: "notify_new_template_version_published",
      subject_i18n_params: {
        template_label: template_version.label,
        version_date: template_version.version_date&.strftime("%B %d, %Y")
      },
      subject_key: subject_key
    )
  end

  def notify_external_api_key_template_update(
    template_version,
    external_api_key,
    change_type:,
    diff_summary:
  )
    @template_version = template_version
    @external_api_key = external_api_key
    @user = nil
    @jurisdiction = external_api_key.jurisdiction
    @jurisdiction_name = @jurisdiction.qualified_name
    @change_type = change_type
    @diff_summary = diff_summary
    @api_enabled = true
    @submission_inbox_action_required = false
    @api_mapping_url =
      FrontendUrlHelper.frontend_url(
        "/jurisdictions/#{@jurisdiction.slug}/api-settings/api-mappings"
      )

    return unless external_api_key.notification_email.present?

    subject_key = template_version_subject_key(change_type)

    send_mail(
      email: external_api_key.notification_email,
      template_key: "notify_new_template_version_published",
      subject_i18n_params: {
        template_label: template_version.label,
        version_date: template_version.version_date&.strftime("%B %d, %Y")
      },
      subject_key: subject_key
    )
  end

  def remind_reviewer(permit_type_submission_contact, permit_applications)
    @permit_applications = permit_applications
    send_mail(
      email: permit_type_submission_contact.email,
      template_key: "remind_reviewer"
    )
  end

  def remind_resource_update(user, jurisdiction, resource_ids)
    @user = user
    @jurisdiction = jurisdiction
    @resources = Resource.where(id: resource_ids)

    send_user_mail(email: user.email, template_key: "remind_resource_update")
  end

  def notify_api_key_status_change(
    external_api_key,
    status,
    interval_days = nil
  )
    @external_api_key = external_api_key
    @status = status # Will be :expiring or :revoked
    @interval_days = interval_days # e.g., 30, 14, 5, 2, 1 or nil
    @jurisdiction_name = @external_api_key.jurisdiction.qualified_name

    # Check if notification email exists before sending
    return unless @external_api_key.notification_email.present?

    send_mail(
      email: @external_api_key.notification_email,
      template_key: "notify_api_key_status_change",
      subject_i18n_params: {
        jurisdiction_name: @jurisdiction_name,
        status: @status == :revoked ? "revoked" : "expiring",
        interval: @interval_days ? "in #{@interval_days} days" : "soon"
      }
    )
  end

  #### PermitTypeSubmission Contact Mailer
  def permit_type_submission_contact_confirm(permit_type_submission_contact)
    @permit_type_submission_contact = permit_type_submission_contact
    send_mail(
      email: permit_type_submission_contact.email,
      template_key: "permit_type_submission_contact_confirm"
    )
  end

  def send_step_code_report_to_jurisdiction(
    report_document:,
    step_code:,
    recipient_email:,
    jurisdiction:,
    sender_user:
  )
    @report_document = report_document
    @step_code = step_code
    @jurisdiction = jurisdiction
    @sender_user = sender_user

    unless report_document.file.present?
      Rails.logger.error(
        "[MAILER] Report document #{report_document.id} has no file attached!"
      )
      raise "Unable to attach report file for emailing"
    end

    Rails.logger.info(
      "[MAILER] Sending report: #{report_document.file_name} (#{report_document.file&.size} bytes)"
    )

    # Attach the file
    add_attachment(report_document)

    send_mail(
      email: recipient_email,
      template_key: "send_step_code_report_to_jurisdiction",
      subject_i18n_params: {
        step_code_title: step_code.title || "Step Code Report",
        jurisdiction_name: jurisdiction.qualified_name
      }
    )
  end

  def send_user_mail(*args, **kwargs)
    return if @user.discarded? || !@user.confirmed?
    send_mail(*args, **kwargs)
  end

  private

  def set_submission_inbox_action_required
    @submission_inbox_action_required = false
    @inbox_setup_url = nil
    return unless @jurisdiction.present?

    has_contact =
      @jurisdiction
        .permit_type_submission_contacts
        .where(permit_type_id: @template_version.permit_type.id)
        .where.not(confirmed_at: nil)
        .exists?

    unless has_contact
      @submission_inbox_action_required = true
      @inbox_setup_url =
        FrontendUrlHelper.frontend_url(
          "/jurisdictions/#{@jurisdiction.slug}/configuration-management/feature-access/submissions-inbox-setup"
        )
    end
  end

  def template_version_subject_key(change_type)
    case change_type
    when :new_template
      "notify_template_version_new_template"
    when :action_required
      "notify_template_version_action_required"
    else
      "notify_template_version_no_action"
    end
  end

  def user_delete_after_days
    default_days = UserDataCleanupJob::DEFAULT_DELETE_AFTER_DAYS
    Integer(ENV.fetch("USER_DELETE_AFTER_DAYS", default_days), 10)
  rescue ArgumentError, TypeError
    default_days
  end

  def login_type_label(user)
    user.omniauth_provider_label || user.omniauth_provider.to_s.titleize ||
      "Unknown"
  end

  def login_identifier(user)
    user.omniauth_username.presence || user.email
  end

  # Helper method to attach a file from a FileUploadAttachment subclass instance
  # @param file_upload_attachment [FileUploadAttachment] A FileUploadAttachment subclass instance (e.g., ReportDocument)
  def add_attachment(file_upload_attachment)
    attachment = file_upload_attachment.file
    return unless attachment

    content = attachment.download.read
    # Force binary encoding for binary files
    content = content.force_encoding(Encoding::BINARY) if content.encoding !=
      Encoding::BINARY

    attachments[attachment.metadata["filename"]] = content
  end
end
