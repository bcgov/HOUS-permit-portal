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
        user_feed_items.map { |f| OpenStruct.new(JSON.parse(f.value, symbolize_names: true).merge({ at: f.at })) },
      total_pages: total_page_count(uf.total_count),
      feed_object: uf,
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
      event = SimpleFeed::Event.new(notification_user_hash[user_id].to_json, Time.now)

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
              activity_metadata(user_id, activity, :total_count),
            ),
          unread_count: activity_metadata(user_id, activity, :unread_count),
          last_read_at: activity_metadata(user_id, activity, :last_read),
        },
      }
    end
    WebsocketBroadcaster.push_user_payloads(payloads)
  end

  def self.publish_new_template_version_publish_event(template_version)
    manager_ids =
      User
        .joins(:preference)
        .where(role: %i[review_manager regional_review_manager])
        .where(users: { preferences: { enable_in_app_new_template_version_publish_notification: true } })
        .pluck(:id)

    relevant_permit_applications =
      PermitApplication
        .select("DISTINCT ON (submitter_id) permit_applications.*")
        .joins(:template_version)
        .joins(submitter: :preference)
        .where(
          template_versions: {
            requirement_template_id: template_version.requirement_template_id,
          },
          status: "draft",
          users: {
            preferences: {
              enable_in_app_new_template_version_publish_notification: true,
            },
          },
        )
        .order("submitter_id, updated_at DESC")

    notification_submitter_hash =
      relevant_permit_applications.each_with_object({}) do |permit_application, hash|
        submitter_id = permit_application.submitter_id
        hash[submitter_id] = template_version.publish_event_notification_data(permit_application)
      end

    notification_manager_hash =
      manager_ids.each_with_object({}) do |manager_id, hash|
        hash[manager_id] = template_version.publish_event_notification_data
      end

    NotificationPushJob.perform_async({ **notification_manager_hash, **notification_submitter_hash })
  end

  def self.publish_missing_requirements_mapping_event(integration_mapping)
    unless integration_mapping.present? && integration_mapping.can_send_template_missing_requirements_communication?
      return
    end

    user_ids_to_notify =
      integration_mapping
        .jurisdiction
        .users
        &.kept
        &.where(role: %i[review_manager regional_review_manager])
        &.pluck(:id) || []

    notification_hash =
      user_ids_to_notify.each_with_object({}) do |user_id, hash|
        hash[
          user_id
        ] = integration_mapping.template_missing_requirements_mapping_event_notification_data if integration_mapping.template_missing_requirements_mapping_event_notification_data.present?
      end

    NotificationPushJob.perform_async(notification_hash)
  end

  def self.publish_customization_update_event(customization)
    template_version = customization.template_version
    relevant_submitter_ids =
      PermitApplication
        .joins(:template_version)
        .joins(submitter: :preference)
        .where(
          template_versions: {
            requirement_template_id: template_version.requirement_template_id,
          },
          status: "draft",
          users: {
            preferences: {
              enable_in_app_customization_update_notification: true,
            },
          },
        )
        .pluck(:submitter_id)
        .uniq

    notification_user_hash =
      relevant_submitter_ids.each_with_object({}) do |submitter_id, hash|
        hash[submitter_id] = customization.update_event_notification_data
      end

    NotificationPushJob.perform_async(notification_user_hash)
  end

  private

  # this is just a wrapper around the activity's metadat methods
  # since in the case of a single instance it returns a specific return type (eg. Integer)
  # but in the case of multiple user_ids the activity is a hash object
  def self.activity_metadata(user_id, activity_obj, method)
    metadata = activity_obj.send(method)
    metadata.is_a?(Hash) ? metadata[user_id] : metadata
  end
end
