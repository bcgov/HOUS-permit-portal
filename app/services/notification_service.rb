class NotificationService
  def self.reset_user_feed_last_read(user_id)
    mf = SimpleFeed.user_feed.activity(user_id)
    mf.reset_last_read
  end

  def self.total_page_count(total_count)
    (total_count.to_f / (ENV["NOTIFICATION_FEED_PER_PAGE"] || 5).to_f || 5).ceil
  end

  def self.user_feed_for(user_id, page)
    uf = SimpleFeed.user_feed.activity(user_id)

    user_feed_items = uf.paginate(page: page.to_i || 1, reset_last_read: false)

    {
      feed_items:
        user_feed_items.map do |f|
          OpenStruct.new(
            JSON.parse(f.value, symbolize_names: true).merge({ at: f.at })
          )
        end,
      total_pages: total_page_count(uf.total_count),
      feed_object: uf
    }
  end

  def self.publish_to_user_feeds(notification_user_hash)
    # Please provide a notification_user_hash where the keys are the users to send to
    # and the values are the user specific notification data

    user_ids_to_publish_to = notification_user_hash.keys

    # send this to the redis store
    # push to specific users
    # we need to calculate page metadata for each user individually
    payloads = {}
    user_ids_to_publish_to.each do |user_id|
      # Create a new event for each user with their respective notification_data
      event =
        SimpleFeed::Event.new(notification_user_hash[user_id].to_json, Time.now)

      # Get the user's feed and store the event
      activity = SimpleFeed.user_feed.activity(user_id)
      activity.store(event: event)
      payloads[user_id] = {
        domain: Constants::Websockets::Events::Notification::DOMAIN,
        event_type: Constants::Websockets::Events::Notification::TYPES[:update],
        data: notification_user_hash[user_id],
        meta: {
          total_pages:
            total_page_count(
              # The result type may be a number or a hash of numbers depending on the number of users being notified
              activity_metadata(user_id, activity, :total_count)
            ),
          unread_count: activity_metadata(user_id, activity, :unread_count),
          last_read_at: activity_metadata(user_id, activity, :last_read)
        }
      }
    end
    WebsocketBroadcaster.push_user_payloads(payloads)
  end

  def self.publish_new_template_version_publish_event(template_version)
    # Respect notification_scope: silent publishes skip all notifications.
    return if template_version.notification_scope_silent?

    requirement_template = template_version.requirement_template

    change_type =
      TemplateVersioningService.determine_change_type(template_version)
    diff_summary =
      TemplateVersioningService.diff_summary_for_notification(template_version)

    available_jurisdiction_ids =
      available_jurisdiction_ids_for(requirement_template)

    disabled_jurisdiction_ids =
      template_version
        .jurisdiction_template_version_customizations
        .live
        .where(disabled: true)
        .distinct
        .pluck(:jurisdiction_id)

    manager_query =
      User
        .joins(:preference)
        .where(role: %i[review_manager regional_review_manager])
        .where(
          users: {
            preferences: {
              enable_in_app_new_template_version_publish_notification: true
            }
          }
        )

    if available_jurisdiction_ids.present?
      manager_query =
        manager_query
          .joins(:jurisdiction_memberships)
          .where(
            jurisdiction_memberships: {
              jurisdiction_id: available_jurisdiction_ids
            }
          )
          .distinct
    end

    if disabled_jurisdiction_ids.any?
      manager_query =
        manager_query
          .joins(:jurisdiction_memberships)
          .where.not(
            jurisdiction_memberships: {
              jurisdiction_id: disabled_jurisdiction_ids
            }
          )
          .distinct
    end

    filtered_manager_ids = manager_query.pluck(:id)
    scoped_manager_ids = targeted_manager_ids_for_publish(template_version)
    manager_ids = scoped_manager_ids & filtered_manager_ids

    relevant_permit_applications =
      PermitApplication
        .kept
        .select("DISTINCT ON (submitter_id) permit_applications.*")
        .joins(:template_version)
        .joins(submitter: :preference)
        .where(
          template_versions: {
            requirement_template_id: template_version.requirement_template_id
          },
          status: PermitApplication.draft_statuses,
          users: {
            preferences: {
              enable_in_app_new_template_version_publish_notification: true
            }
          }
        )
        .order("submitter_id, updated_at DESC")

    notification_submitter_hash =
      relevant_permit_applications.each_with_object(
        {}
      ) do |permit_application, hash|
        submitter_id = permit_application.submitter_id
        hash[submitter_id] = template_version.publish_event_notification_data(
          permit_application
        )
      end

    notification_manager_hash =
      manager_ids.each_with_object({}) do |manager_id, hash|
        hash[manager_id] = template_version.publish_event_notification_data
      end

    notification_hash = {
      **notification_manager_hash,
      **notification_submitter_hash
    }

    if notification_hash.any?
      NotificationPushJob.perform_async(notification_hash)
    end

    # Send emails to users who have email notifications enabled
    user_ids = notification_hash.keys
    users_with_email_enabled =
      User
        .includes(:jurisdictions)
        .joins(:preference)
        .where(id: user_ids)
        .where(
          preferences: {
            enable_email_new_template_version_publish_notification: true
          }
        )
        .index_by(&:id)

    notification_hash.each do |user_id, notification_data|
      user = users_with_email_enabled[user_id]
      next unless user

      jurisdiction = user.manager? ? user.jurisdictions.first : nil

      PermitHubMailer.notify_new_template_version_published(
        template_version,
        user,
        jurisdiction: jurisdiction,
        change_type: change_type,
        diff_summary: diff_summary
      ).deliver_later
    end

    # Send emails to ExternalApiKey recipients for API-enabled jurisdictions
    send_external_api_key_notifications(
      template_version,
      available_jurisdiction_ids,
      disabled_jurisdiction_ids,
      change_type: change_type,
      diff_summary: diff_summary
    )
  end

  # ── Draft notification methods ────────────────────────────────────────

  # Notifies invited previewers when a draft version is shared for review.
  # Low noise: only the invited users receive this notification.
  def self.publish_draft_shared_event(template_version)
    return unless template_version.draft?

    previewer_ids =
      template_version.template_version_previews.kept.pluck(:previewer_id)
    return if previewer_ids.blank?

    notification_data = {
      "id" => SecureRandom.uuid,
      "action_type" => "draft_shared_for_review",
      "action_text" =>
        "You've been invited to preview a draft template: #{template_version.label}",
      "object_data" => {
        "template_version_id" => template_version.id,
        "requirement_template_id" => template_version.requirement_template_id
      }
    }

    notification_hash =
      previewer_ids.each_with_object({}) do |user_id, hash|
        hash[user_id] = notification_data
      end

    NotificationPushJob.perform_async(notification_hash)
  end

  # Sends advance notice to jurisdictions when a template version is scheduled.
  # Only notifies jurisdictions that currently use this template (via customizations
  # on the published version). Opt-in: caller decides whether to trigger this.
  def self.publish_version_scheduled_event(template_version)
    return unless template_version.scheduled?

    manager_ids = targeted_manager_ids_for_publish(template_version)
    return if manager_ids.blank?

    notification_data = {
      "id" => SecureRandom.uuid,
      "action_type" => "template_version_scheduled",
      "action_text" =>
        "A new version of #{template_version.requirement_template.label} is scheduled for #{template_version.version_date}.",
      "object_data" => {
        "template_version_id" => template_version.id,
        "requirement_template_id" => template_version.requirement_template_id,
        "version_date" => template_version.version_date.to_s,
        "change_notes" => template_version.change_notes
      }
    }

    notification_hash =
      manager_ids.each_with_object({}) do |manager_id, hash|
        hash[manager_id] = notification_data
      end

    NotificationPushJob.perform_async(notification_hash)
  end

  # Sends differentiated template update emails to ExternalApiKey contacts
  # for all API-enabled jurisdictions that have access to this template.
  def self.send_external_api_key_notifications(
    template_version,
    available_jurisdiction_ids,
    disabled_jurisdiction_ids,
    change_type:,
    diff_summary:
  )
    api_jurisdictions = Jurisdiction.where(external_api_state: "j_on")

    if available_jurisdiction_ids.present?
      api_jurisdictions =
        api_jurisdictions.where(id: available_jurisdiction_ids)
    end

    if disabled_jurisdiction_ids.any?
      api_jurisdictions =
        api_jurisdictions.where.not(id: disabled_jurisdiction_ids)
    end

    api_jurisdictions.find_each do |jurisdiction|
      active_keys =
        jurisdiction
          .external_api_keys
          .where(revoked_at: nil)
          .where("expired_at IS NULL OR expired_at > ?", Time.current)
          .where.not(notification_email: [nil, ""])

      active_keys.each do |api_key|
        PermitHubMailer.notify_external_api_key_template_update(
          template_version,
          api_key,
          change_type: change_type,
          diff_summary: diff_summary
        ).deliver_later
      end
    end
  end

  # Returns jurisdiction IDs that have access to this template,
  # or nil if the template is globally available.
  def self.available_jurisdiction_ids_for(requirement_template)
    if requirement_template.available_globally
      nil
    else
      requirement_template.jurisdiction_requirement_templates.pluck(
        :jurisdiction_id
      )
    end
  end

  def self.publish_customization_update_event(customization)
    template_version = customization.template_version
    relevant_submitter_ids =
      PermitApplication
        .kept
        .joins(:template_version)
        .joins(submitter: :preference)
        .where(
          template_versions: {
            requirement_template_id: template_version.requirement_template_id
          },
          status: PermitApplication.draft_statuses,
          users: {
            preferences: {
              enable_in_app_customization_update_notification: true
            }
          }
        )
        .pluck(:submitter_id)
        .uniq

    notification_user_hash =
      relevant_submitter_ids.each_with_object({}) do |submitter_id, hash|
        hash[submitter_id] = customization.update_event_notification_data
      end

    NotificationPushJob.perform_async(notification_user_hash)
  end

  def self.publish_permit_collaboration_assignment_event(permit_collaboration)
    user = permit_collaboration.collaborator&.user
    return unless user&.preference&.enable_in_app_collaboration_notification

    notification_user_hash = {
      user.id => permit_collaboration.collaboration_assignment_notification_data
    }

    NotificationPushJob.perform_async(notification_user_hash)
  end

  def self.publish_permit_collaboration_unassignment_event(permit_collaboration)
    collaborator_user_id = permit_collaboration.collaborator.user_id

    notification_user_hash = {
      collaborator_user_id =>
        permit_collaboration.collaboration_unassignment_notification_data
    }

    NotificationPushJob.perform_async(notification_user_hash)
  end

  def self.publish_project_collaboration_assignment_event(
    permit_project_collaboration
  )
    user = permit_project_collaboration.collaborator&.user
    return unless user&.preference&.enable_in_app_collaboration_notification

    notification_user_hash = {
      user.id =>
        permit_project_collaboration.collaboration_assignment_notification_data
    }

    NotificationPushJob.perform_async(notification_user_hash)
  end

  def self.publish_project_collaboration_unassignment_event(
    permit_project_collaboration
  )
    user = permit_project_collaboration.collaborator&.user
    return unless user&.preference&.enable_in_app_collaboration_notification

    notification_user_hash = {
      user.id =>
        permit_project_collaboration.collaboration_unassignment_notification_data
    }

    NotificationPushJob.perform_async(notification_user_hash)
  end

  def self.publish_permit_block_status_ready_event(permit_block_status)
    unless permit_block_status.ready? && permit_block_status.block_exists?
      return
    end

    notification_user_hash = {}

    permit_block_status.users_to_notify_status_ready.each do |user|
      next unless user.preference&.enable_in_app_collaboration_notification

      notification_user_hash[
        user.id
      ] = permit_block_status.status_ready_notification_data
    end

    NotificationPushJob.perform_async(notification_user_hash)
  end

  def self.publish_step_code_report_generated_event(report_document)
    step_code = report_document.step_code
    return if step_code.blank?

    # Determine recipient users:
    # If the step code belongs to a permit application, notify the submitter; otherwise notify the creator
    user_ids = []
    if step_code.permit_application.present?
      submitter_id = step_code.permit_application.submitter_id
      user_ids << submitter_id if submitter_id.present?
    end

    creator_id = step_code.creator_id
    user_ids << creator_id if creator_id.present?

    notification_user_hash =
      user_ids
        .compact
        .uniq
        .each_with_object({}) do |uid, hash|
          hash[uid] = report_document.report_generated_event_notification_data
        end

    unless notification_user_hash.empty?
      NotificationPushJob.perform_async(notification_user_hash)
    end
  end

  def self.publish_pre_check_submitted_event(pre_check)
    return if pre_check.blank? || pre_check.creator_id.blank?

    notification_user_hash = {
      pre_check.creator_id => pre_check.submission_event_notification_data
    }

    NotificationPushJob.perform_async(notification_user_hash)

    # Send email notification
    PermitHubMailer.notify_pre_check_submitted(pre_check).deliver_later
  end

  def self.publish_pre_check_completed_event(pre_check)
    return if pre_check.blank? || pre_check.creator_id.blank?

    notification_user_hash = {
      pre_check.creator_id => pre_check.completed_event_notification_data
    }

    NotificationPushJob.perform_async(notification_user_hash)

    # Send email notification
    PermitHubMailer.notify_pre_check_completed(pre_check).deliver_later
  end

  def self.publish_application_submission_event(permit_application)
    notification_user_hash = {}

    users_that_can_submit = [permit_application.submitter]

    designated_submitter_user =
      permit_application.users_by_collaboration_options(
        collaboration_type: :submission,
        collaborator_type: :delegatee
      ).first
    assignee_users =
      permit_application.users_by_collaboration_options(
        collaboration_type: :submission,
        collaborator_type: :assignee
      )

    if designated_submitter_user.present?
      users_that_can_submit << designated_submitter_user
    end

    users_that_can_submit.each do |user|
      if user.preference&.enable_in_app_application_submission_notification
        notification_user_hash[
          user.id
        ] = permit_application.submit_event_notification_data
      end

      if user.preference&.enable_email_application_submission_notification
        PermitHubMailer.notify_submitter_application_submitted(
          permit_application,
          user
        )&.deliver_later
      end

      permit_application
        .confirmed_permit_type_submission_contacts
        .each do |permit_type_submission_contact|
        PermitHubMailer.notify_reviewer_application_received(
          permit_type_submission_contact,
          permit_application
        ).deliver_later
      end
    end

    # assignees to be notified
    assignee_users.each do |user|
      # skip the designated submitter as they have already been added and use a different preference settings
      next if user.id == designated_submitter_user&.id

      if user.preference&.enable_in_app_collaboration_notification
        notification_user_hash[
          user.id
        ] = permit_application.submit_event_notification_data
      end

      if user.preference&.enable_email_collaboration_notification
        PermitHubMailer.notify_submitter_application_submitted(
          permit_application,
          user
        )&.deliver_later
      end
    end

    unless notification_user_hash.empty?
      NotificationPushJob.perform_async(notification_user_hash)
    end
  end

  def self.publish_application_revisions_request_event(permit_application)
    notification_user_hash = {}

    users_that_can_submit = [permit_application.submitter]

    designated_submitter_user =
      permit_application.users_by_collaboration_options(
        collaboration_type: :submission,
        collaborator_type: :delegatee
      ).first

    if designated_submitter_user.present?
      users_that_can_submit << designated_submitter_user
    end

    users_that_can_submit.each do |user|
      if user.preference&.enable_in_app_application_revisions_request_notification
        notification_user_hash[
          user.id
        ] = permit_application.revisions_request_event_notification_data
      end

      if user.preference&.enable_email_application_revisions_request_notification
        PermitHubMailer.notify_application_revisions_requested(
          permit_application,
          user
        )&.deliver_later
      end
    end

    unless notification_user_hash.empty?
      NotificationPushJob.perform_async(notification_user_hash)
    end
  end

  def self.publish_review_started_event(permit_application)
    notification_user_hash = {}
    notification_user_hash[
      permit_application.submitter_id
    ] = permit_application.review_started_event_notification_data
    preference = permit_application.submitter.preference
    if preference.enable_email_application_view_notification
      PermitHubMailer.notify_review_started(permit_application).deliver_later
    end
    if preference.enable_in_app_application_view_notification
      NotificationPushJob.perform_async(notification_user_hash)
    end
  end

  def self.publish_file_upload_failed_event(file_attachment, file_name: nil)
    return if file_attachment.blank?

    # Determine the users to notify based on the attached_to relationship
    users_to_notify = determine_file_owner(file_attachment)
    return if users_to_notify.blank?

    # Ensure users_to_notify is an array
    users_to_notify = [users_to_notify] unless users_to_notify.is_a?(Array)

    notification_user_hash = {}
    users_to_notify.each do |user|
      next if user.blank?
      # Ensure user.id is a string
      notification_user_hash[
        user.id
      ] = file_attachment.upload_failed_notification_data(file_name)
    end

    return if notification_user_hash.empty?
    NotificationPushJob.perform_async(notification_user_hash)
  end

  # Determines the owner/uploader of a file attachment for notification purposes
  def self.determine_file_owner(file_attachment)
    attached_to = file_attachment.attached_to
    return nil if attached_to.blank?

    case attached_to
    when PermitApplication
      [attached_to.submitter]
    when RequirementBlock
      # For requirement blocks, notify all super admins
      User.where(role: :super_admin).to_a
    when Resource
      attached_to.jurisdiction.managers
    else
      # Try common patterns
      user =
        attached_to.try(:submitter) || attached_to.try(:creator) ||
          attached_to.try(:user) || attached_to.try(:owner)
      user ? [user] : nil
    end
  end

  def self.publish_resource_reminder_event(jurisdiction, resource_ids)
    all_managers = jurisdiction.managers

    return if all_managers.empty?

    notification_user_hash = {}

    notification_data =
      Resource.resource_reminder_notification_data(
        jurisdiction.id,
        resource_ids
      )

    all_managers.each do |manager|
      if manager.preference&.enable_in_app_resource_reminder_notification
        notification_user_hash[manager.id] = notification_data
      end

      if manager.preference&.enable_email_resource_reminder_notification
        PermitHubMailer.remind_resource_update(
          manager,
          jurisdiction,
          resource_ids
        ).deliver_later
      end
    end

    unless notification_user_hash.empty?
      NotificationPushJob.perform_async(notification_user_hash)
    end
  end

  private_class_method :determine_file_owner
  private_class_method :send_external_api_key_notifications
  private_class_method :available_jurisdiction_ids_for

  # Determines which review managers to notify based on the template version's
  # notification_scope. This is the core targeting logic.
  #
  # - all_jurisdictions (default): All managers with the notification preference enabled.
  # - specific_jurisdictions: Only managers belonging to the jurisdictions listed
  #   in notified_jurisdiction_ids. This is for targeted fixes (e.g., a typo
  #   reported by one jurisdiction -- only notify them, not everyone).
  # - silent: Returns empty (caller should skip notifications entirely).
  def self.targeted_manager_ids_for_publish(template_version)
    return [] if template_version.notification_scope_silent?

    base_query =
      User
        .joins(:preference)
        .where(role: %i[review_manager regional_review_manager])
        .where(
          users: {
            preferences: {
              enable_in_app_new_template_version_publish_notification: true
            }
          }
        )

    if template_version.notification_scope_specific_jurisdictions?
      target_jurisdiction_ids = template_version.notified_jurisdiction_ids || []
      return [] if target_jurisdiction_ids.blank?

      # Only notify managers who belong to the targeted jurisdictions
      base_query
        .joins(:jurisdictions)
        .where(jurisdictions: { id: target_jurisdiction_ids })
        .distinct
        .pluck(:id)
    else
      # all_jurisdictions (default): notify all managers with the preference enabled
      base_query.pluck(:id)
    end
  end

  private_class_method :targeted_manager_ids_for_publish

  # this is just a wrapper around the activity's metadata methods
  # since in the case of a single instance it returns a specific return type (eg. Integer)
  # but in the case of multiple user_ids the activity is a hash object
  def self.activity_metadata(user_id, activity_obj, method)
    metadata = activity_obj.send(method)
    metadata.is_a?(Hash) ? metadata[user_id] : metadata
  end

  private_class_method :activity_metadata
end
