class IntegrationMapping < ApplicationRecord
  # The IntegrationMapping model represents the mapping
  # between jurisdictions local system fields and template versions fields.

  # The schema of the request_mapping is as follows:
  # {
  #  [requirement_block_sku]: {
  #   id: [requirement_block_id],
  #  requirements: {
  #   [requirement_code]: {
  #   id: [requirement_id],
  #  local_system_mapping: local_system_field_attribute}
  # }
  belongs_to :jurisdiction
  belongs_to :template_version

  validates_uniqueness_of :template_version_id, scope: :jurisdiction_id

  before_create :initialize_requirements_mapping

  after_update :sync_changes_with_other_currently_active_mappings
  after_create :send_missing_requirements_mapping_communication

  attr_accessor :simplified_map_to_sync

  def jurisdiction_template_version_customization
    JurisdictionTemplateVersionCustomization.find_by(
      jurisdiction:,
      template_version:
    )
  end

  def missing_requirements_mapping
    missing_mapping = {}
    template_version_customization = jurisdiction_template_version_customization

    requirements_mapping.each do |requirement_block_sku, requirement_block|
      requirement_block["requirements"]&.each do |requirement_code, requirement|
        is_elective =
          !!template_version.get_requirement_json(
            requirement_block["id"],
            requirement["id"]
          )&.dig("elective")
        enabled =
          !!template_version_customization&.elective_enabled?(
            requirement_block["id"],
            requirement["id"]
          )

        next if is_elective && !enabled

        next unless requirement["local_system_mapping"].blank?

        missing_mapping[requirement_block_sku] ||= {
          "id" => requirement_block["id"],
          "requirements" => {
          }
        }
        missing_mapping[requirement_block_sku]["requirements"][
          requirement_code
        ] = requirement
      end
    end

    missing_mapping
  end

  def missing_any_requirements_mapping?
    !missing_requirements_mapping.empty?
  end

  def template_missing_requirements_mapping_event_notification_data
    return nil unless can_send_template_missing_requirements_communication?

    {
      "id" => SecureRandom.uuid,
      "action_type" => template_missing_requirements_event_type,
      "action_text" =>
        "#{I18n.t("notification.integration_mapping.#{template_version.published? ? "published" : "scheduled"}_template_missing_requirements_mapping", template_label: template_version.label, version_date: template_version.version_date)}",
      "object_data" => {
        "template_version_id" => template_version_id
      }
    }
  end

  # Updates the requirements mapping of the current model instance.
  # This method takes a simplified map of the requirements and updates the existing mapping accordingly.
  # The simplified map should be a hash where each key is a requirement block SKU and the value is another hash.
  # The inner hash should have requirement codes as keys and local system mapping as values.
  #
  # Unless explicitly ignored, the method will also set the simplified_map_to_sync attribute to the given simplified_map,
  # which will be used to sync the changes with other currently active mappings.
  #
  # Note: mappings which does now exist in the original mapping will not be created.
  # @param simplified_map [Hash] the simplified map of requirements
  # @param skip_sync [Boolean] whether to ignore syncing the changes with other currently active mappings
  # @return [Boolean] true if the update was successful, false otherwise
  def update_requirements_mapping(simplified_map, skip_sync = false)
    self.with_lock do
      new_requirements_mapping =
        IntegrationMappingService.new(self).get_updated_requirements_mapping(
          simplified_map
        )

      # nothing to update, so returns true
      return true if self.requirements_mapping == new_requirements_mapping

      unless new_requirements_mapping.blank?
        self.simplified_map_to_sync = simplified_map unless skip_sync
        self.requirements_mapping = new_requirements_mapping

        return self.save
      end
    end

    false
  end

  # This method is used to return a copyable record with existing mapping
  # for a given requirement block sku and requirement code.
  # It returns the first record with a published template version if it exists,
  # otherwise it returns the first record.
  #
  # @param requirement_block_sku [String] the sku of the requirement block
  # @param requirement_code [String] the code of the requirement
  #
  # @return [IntegrationMapping] the copyable record with existing mapping
  def copyable_record_with_existing_mapping(
    requirement_block_sku,
    requirement_code
  )
    IntegrationMappingService.new(self).copyable_record_with_existing_mapping(
      requirement_block_sku,
      requirement_code
    )
  end

  def send_missing_requirements_mapping_communication
    send_missing_requirements_mapping_notification
    send_missing_requirements_mapping_email
  end

  def send_missing_requirements_mapping_notification
    return unless can_send_template_missing_requirements_communication?

    event_id = requirements_mapping_event_id("notification")

    return false if Rails.cache.exist?(event_id)

    Rails.cache.write(event_id, true, expires_in: 5.minutes)

    NotificationService.publish_missing_requirements_mapping_event(self)
  end

  def send_missing_requirements_mapping_email
    return unless can_send_template_missing_requirements_communication?

    event_id = requirements_mapping_event_id("email")

    return false if Rails.cache.exist?(event_id)

    Rails.cache.write(event_id, true, expires_in: 5.minutes)

    users_to_notify =
      jurisdiction
        .users
        .kept
        .includes(:preference)
        .where(
          role: %w[review_manager regional_review_manager],
          preferences: {
            enable_email_integration_mapping_notification: true
          }
        )
    users_to_notify.uniq.each do |user|
      unless user.preference&.enable_email_integration_mapping_notification &&
               jurisdiction.external_api_enabled? &&
               (user.review_manager? || user.regional_review_manager?) &&
               (template_version.published? || template_version.scheduled?)
        return
      end

      IntegrationMappingNotification.create(
        notifiable: user,
        front_end_path: front_end_edit_path,
        template_version: template_version # Associate the template version
      )
    end

    external_api_keys = ExternalApiKey.active.where(jurisdiction: jurisdiction)

    # Notify external API key integrations
    external_api_keys.uniq.each do |external_api_key|
      next unless external_api_key.notification_email.present?

      unless external_api_key.notification_email.present? &&
               external_api_key.jurisdiction.external_api_enabled? &&
               (template_version.published? || template_version.scheduled?)
        return
      end

      # Create a notification record instead of sending the email immediately
      IntegrationMappingNotification.create(
        notifiable: external_api_key,
        template_version: template_version # Associate the template version
      )
    end
  end

  def can_send_template_missing_requirements_communication?
    jurisdiction.external_api_enabled? && missing_any_requirements_mapping? &&
      (template_version.published? || template_version.scheduled?)
  end

  def front_end_edit_path
    "/jurisdictions/#{jurisdiction.slug}/api-settings/api-mappings/digital-building-permits/#{template_version.id}/edit"
  end

  def elective_filtered_requirements_mapping
    template_version_customization = jurisdiction_template_version_customization

    elective_filtered_mapping = {}

    requirements_mapping.each do |requirement_block_sku, requirement_block|
      requirement_block["requirements"]&.each do |requirement_code, requirement|
        is_elective =
          !!template_version.get_requirement_json(
            requirement_block["id"],
            requirement["id"]
          )&.dig("elective")
        enabled =
          !!template_version_customization&.elective_enabled?(
            requirement_block["id"],
            requirement["id"]
          )

        next if is_elective && !enabled

        elective_filtered_mapping[requirement_block_sku] ||= {
          "id" => requirement_block["id"],
          "requirements" => {
          }
        }
        elective_filtered_mapping[requirement_block_sku]["requirements"][
          requirement_code
        ] = requirement
      end
    end

    elective_filtered_mapping
  end

  private

  def initialize_requirements_mapping
    IntegrationMappingService.new(self).initialize_requirements_mapping!
  end

  # Synchronizes changes with other currently active mappings for published template versions.
  # This method is called after the requirements mapping of the current instance is updated.
  # It iterates over all other active mappings for the same jurisdiction that are associated with a published template version.
  # For each of these mappings, it updates their requirements mapping with the simplified map of the current instance.
  # The simplified map is a hash where each key is a requirement block SKU and the value is another hash.
  # The inner hash has requirement codes as keys and local system mapping as values.
  # The method ignores the current instance during this process and also marks the other mapping to not do the same syncing process.
  # Note: This method does nothing if the simplified map to sync is not present or is not a hash.
  #
  # @return [void]

  def sync_changes_with_other_currently_active_mappings
    unless simplified_map_to_sync.present? &&
             simplified_map_to_sync.is_a?(Hash) &&
             (template_version.published? || template_version.scheduled?)
      return
    end

    active_mappings =
      IntegrationMapping
        .joins(:template_version)
        .where(
          jurisdiction_id: jurisdiction_id,
          template_versions: {
            status:
              template_version.published? ? %i[published scheduled] : :scheduled
          }
        )
        .where.not(id: id)

    active_mappings.each do |mapping|
      mapping.update_requirements_mapping(simplified_map_to_sync, true)
    end
  end

  def template_missing_requirements_event_type
    if template_version.published?
      Constants::NotificationActionTypes::PUBLISHED_TEMPLATE_MISSING_REQUIREMENTS_MAPPING
    elsif template_version.scheduled?
      Constants::NotificationActionTypes::SCHEDULED_TEMPLATE_MISSING_REQUIREMENTS_MAPPING
    end
  end

  def requirements_mapping_event_id(communication_type)
    "#{self.class.name.underscore}_#{id}_#{communication_type}_event_#{template_missing_requirements_event_type}"
  end
end
