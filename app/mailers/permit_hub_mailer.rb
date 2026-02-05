class PermitHubMailer < ApplicationMailer
  # define instance variables that will be used in the view template
  def welcome(user)
    @user = user
    send_user_mail(email: user.email, template_key: "welcome")
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

    send_user_mail(
      email: @user.email,
      template_key: :notify_permit_collaboration
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

    return unless @early_access_preview.early_access_requirement_template

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

  def send_batched_integration_mapping_notifications(
    notifiable,
    notification_ids
  )
    # This should be called by the SendBatchedIntegrationMappingNotificationsJob

    @notifications = IntegrationMappingNotification.where(id: notification_ids)

    return unless @notifications.any?

    if notifiable.is_a?(User)
      @user = notifiable
      send_user_mail(
        email: notifiable.email,
        template_key: "notify_batched_integration_mapping"
      )
    elsif notifiable.is_a?(ExternalApiKey)
      @external_api_key = notifiable
      @jurisdiction_name = @external_api_key&.jurisdiction.qualified_name
      send_mail(
        email: notifiable.notification_email,
        template_key: "notify_batched_integration_mapping"
      )
    end
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

  def notify_application_viewed(permit_application)
    @user = permit_application.submitter
    @permit_application = permit_application
    send_user_mail(
      email: @user.email,
      template_key: "notify_application_viewed",
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
    jurisdiction = nil
  )
    @template_version = template_version
    @user = user
    @jurisdiction = jurisdiction

    # Check if action is required (manager's jurisdiction missing submission contact for this permit type)
    @action_required = false
    @inbox_setup_url = nil
    if @jurisdiction.present?
      has_contact =
        @jurisdiction
          .permit_type_submission_contacts
          .where(permit_type_id: template_version.permit_type.id)
          .where.not(confirmed_at: nil)
          .exists?

      unless has_contact
        @action_required = true
        @inbox_setup_url =
          FrontendUrlHelper.frontend_url(
            "/jurisdictions/#{@jurisdiction.slug}/configuration-management/feature-access/submissions-inbox-setup"
          )
      end
    end

    subject_prefix = @action_required ? "ACTION REQUIRED: " : ""

    send_user_mail(
      email: @user.email,
      template_key: "notify_new_template_version_published",
      subject_i18n_params: {
        template_label: "#{subject_prefix}#{template_version.label}"
      }
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
