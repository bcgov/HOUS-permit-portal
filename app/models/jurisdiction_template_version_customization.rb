class JurisdictionTemplateVersionCustomization < ApplicationRecord
  # The expected schema of the :customizations json is the following
  # {
  #   requirement_block_changes?: Record<UUID, {
  #     tip?: string
  #     resource_ids?: Array<UUID>
  #     enabled_elective_field_ids?: Array<UUID>
  #     optional_elective_field_ids?: Array<UUID>
  #     enabled_elective_field_reasons?: Record<UUID, string>
  #   }>
  # }
  # Where the key to requirement_block_changes object is the id of the requirement_block affected.
  # Where the elective_fields are the ids of the requirement_fields that are elective and have been
  # enabled
  belongs_to :sandbox, optional: true
  belongs_to :jurisdiction
  belongs_to :submission_contact, optional: true

  belongs_to :template_version

  has_many :customization_changes, dependent: :destroy

  before_save :sanitize_tip
  # Ensure that there is no two customizations with the same sandbox, jurisdiction, and template_version

  validate :unique_combination_of_jurisdiction_sandbox_and_template_version

  after_commit :reindex_jurisdiction_templates_used_size
  after_save :record_published_elective_change
  after_commit :publish_customization_event, on: %i[create update]

  validate :ensure_reason_set_for_enabled_elective_fields
  validate :sandbox_belongs_to_jurisdiction

  scope :sandboxed, -> { where.not(sandbox_id: nil) }
  scope :live, -> { where(sandbox_id: nil) }
  scope :for_sandbox, ->(sandbox) { where(sandbox_id: sandbox&.id) }
  scope :not_disabled, -> { where(disabled: false) }
  scope :requiring_project_meeting, -> { where(requires_project_meeting: true) }

  ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS = %w[bylaw policy zoning].freeze

  def self.elective_field_sets(customizations)
    blocks = customizations&.dig("requirement_block_changes") || {}
    enabled = []
    optional = []
    blocks.each_value do |value|
      next unless value.is_a?(Hash)

      enabled.concat(Array(value["enabled_elective_field_ids"]))
      optional.concat(Array(value["optional_elective_field_ids"]))
    end
    [
      enabled.compact.map(&:to_s).uniq.sort,
      optional.compact.map(&:to_s).uniq.sort
    ]
  end

  def self.elective_sets_changed?(before_json, after_json)
    elective_field_sets(before_json) != elective_field_sets(after_json)
  end

  # enabled: newly turned on. disabled: turned off. optional: still on, required/optional flipped.
  def self.elective_field_change(before_json, after_json)
    before_enabled, before_optional = elective_field_sets(before_json)
    after_enabled, after_optional = elective_field_sets(after_json)
    still_enabled = after_enabled & before_enabled
    flipped =
      still_enabled.select do |id|
        before_optional.include?(id) != after_optional.include?(id)
      end
    {
      enabled: after_enabled - before_enabled,
      disabled: before_enabled - after_enabled,
      optional: flipped
    }
  end

  def elective_enabled?(requirement_block_id, requirement_id)
    if customizations.blank? ||
         customizations["requirement_block_changes"].blank?
      return false
    end

    !!customizations.dig(
      "requirement_block_changes",
      requirement_block_id,
      "enabled_elective_field_ids"
    )&.include?(requirement_id)
  end

  def update_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::CUSTOMIZATION_UPDATE,
      "action_text" =>
        "#{I18n.t("notification.template_version.new_customization_notification", jurisdiction_name: jurisdiction.qualified_name, template_label: template_version.label)}",
      "object_data" => {
        "template_version_id" => template_version.id,
        "requirement_template_id" => template_version.requirement_template_id,
        "customizations" => customizations
      }
    }
  end

  def elective_published_notification_data(change)
    labels = change.field_labels
    i18n_key =
      if labels.present?
        "notification.template_version.elective_published_notification"
      else
        "notification.template_version.elective_published_notification_unnamed"
      end
    i18n_opts = {
      jurisdiction_name: jurisdiction.qualified_name,
      template_label: template_version.label
    }
    i18n_opts[:field_labels] = labels.to_sentence if labels.present?
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::ELECTIVE_PUBLISHED,
      "action_text" => I18n.t(i18n_key, **i18n_opts),
      "object_data" => {
        "template_version_id" => template_version.id,
        "requirement_template_id" => template_version.requirement_template_id,
        "customization_change_id" => change.id,
        "enabled_components" => change.enabled_components,
        "disabled_components" => change.disabled_components,
        "optional_components" => change.optional_components
      }
    }
  end

  def label
    "#{jurisdiction.name} #{template_version.label}"
  end

  def self.requirement_count_by_reason(
    requirement_block_id,
    requirement_id,
    reason
  )
    return 0 unless ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.include?(reason)

    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_block_id -> 'enabled_elective_field_ids' @> :id",
        requirement_block_id: requirement_block_id,
        id: "[\"#{requirement_id}\"]"
      )
      .select do |jtvc|
        jtvc
          .customizations
          .dig(
            "requirement_block_changes",
            requirement_block_id,
            "enabled_elective_field_reasons"
          )
          &.values
          &.include?(reason)
      end
      .count
  end

  def self.count_of_jurisdictions_using_requirement(
    requirement_block_id,
    requirement_id
  )
    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_block_id -> 'enabled_elective_field_ids' @> :id",
        requirement_block_id: requirement_block_id,
        id: "[\"#{requirement_id}\"]"
      )
      .count
  end

  def promote
    # Find or create a record with same jurisdiction_id and template_version_id but with sandbox_id == nil
    target_record =
      JurisdictionTemplateVersionCustomization.find_or_create_by(
        jurisdiction_id: jurisdiction_id,
        template_version_id: template_version_id,
        sandbox_id: nil
      )
    target_record.customizations = customizations
    target_record.disabled = disabled
    target_record.requires_project_meeting = requires_project_meeting
    target_record.save!
  end

  after_commit :update_template_version_unique_customizations_count,
               on: %i[create destroy]
  after_commit :update_template_version_unique_customizations_count,
               on: :update,
               if: -> { saved_change_to_disabled? }

  private

  def record_published_elective_change
    @elective_publish_notices ||= []
    @elective_publish_notices << elective_change_for_this_save
  end

  def elective_change_for_this_save
    return unless sandbox_id.nil?
    return unless published_electives_changed?

    before_json, after_json =
      saved_change_to_customizations || [nil, customizations]
    change = self.class.elective_field_change(before_json, after_json)
    return if change.values.all?(&:empty?)

    customization_changes.create!(
      enabled_components: components_for(change[:enabled]),
      disabled_components: components_for(change[:disabled]),
      optional_components: components_for(change[:optional])
    )
  end

  def components_for(ids)
    ids.map do |id|
      component = form_component_index[id.to_s] || {}
      {
        "id" => id.to_s,
        "label" => component["label"],
        "key" => component["key"]
      }
    end
  end

  def form_component_index
    @form_component_index ||=
      begin
        index = {}
        root = template_version&.form_json
        components = root.is_a?(Hash) ? root["components"] : nil
        index_form_components(components, index)
        index
      end
  end

  def index_form_components(components, index)
    Array(components).each do |component|
      next unless component.is_a?(Hash)

      index[component["id"].to_s] = component if component["id"].present?
      if component["components"]
        index_form_components(component["components"], index)
      end
    end
  end

  def update_template_version_unique_customizations_count
    return unless template_version

    unique_count =
      template_version
        .jurisdiction_template_version_customizations
        .live
        .distinct
        .count(:jurisdiction_id)
    template_version.update_columns(
      jurisdiction_template_version_customizations_count: unique_count
    )
    template_version.requirement_template&.reindex
  end

  def reindex_jurisdiction_templates_used_size
    return unless jurisdiction.present?
    return unless new_record? || destroyed? || saved_change_to_jurisdiction_id?

    jurisdiction.reindex
    template_version&.requirement_template&.reindex
  end

  def sanitize_tip
    if customizations.blank? ||
         customizations["requirement_block_changes"].blank?
      return
    end

    customizations["requirement_block_changes"].each do |key, value|
      next if value["tip"].blank?
      customizations["requirement_block_changes"][key][
        "tip"
      ] = ActionController::Base.helpers.sanitize(value["tip"])
    end
  end

  def ensure_reason_set_for_enabled_elective_fields
    if customizations.blank? ||
         customizations["requirement_block_changes"].blank?
      return
    end

    customizations["requirement_block_changes"].each do |_key, value|
      next if value["enabled_elective_field_ids"].blank?

      any_missing_or_incorrect_reason =
        value["enabled_elective_field_ids"].any? do |field_id|
          return true if value["enabled_elective_field_reasons"].blank?

          value["enabled_elective_field_reasons"][field_id].blank? ||
            ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.none? do |reason|
              reason == value["enabled_elective_field_reasons"][field_id]
            end
        end

      if any_missing_or_incorrect_reason
        errors.add(
          :customizations,
          I18n.t(
            "model_validation.jurisdiction_template_version_customization.enabled_elective_field_reason_incorrect",
            accepted_reasons: ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.join(", ")
          )
        )
      end
    end
  end

  def publish_customization_event
    # One entry per save. Promote creates an empty live row and then updates it
    # inside one lock, so both after_commits see the same object.
    change = @elective_publish_notices&.shift
    if change
      NotificationService.publish_elective_published_event(self, change)
    elsif !previously_new_record?
      NotificationService.publish_customization_update_event(self)
    end
  end

  def published_electives_changed?
    return false unless saved_change_to_customizations || previously_new_record?

    before_json, after_json =
      saved_change_to_customizations || [nil, customizations]
    self.class.elective_sets_changed?(before_json, after_json)
  end

  def unique_combination_of_jurisdiction_sandbox_and_template_version
    # Construct the query for finding duplicates
    existing_record =
      JurisdictionTemplateVersionCustomization.where(
        jurisdiction_id: jurisdiction_id,
        template_version_id: template_version_id,
        sandbox_id: sandbox_id
      )

    # Allow updates on the same record (ignore self)
    existing_record = existing_record.where.not(id: id) if persisted?

    # If such a record exists, add an error
    if existing_record.exists?
      errors.add(
        :base,
        I18n.t(
          "activerecord.errors.models.jurisdiction_template_version_customizations.uniqueness"
        )
      )
    end
  end

  def sandbox_belongs_to_jurisdiction
    return unless sandbox

    unless jurisdiction.sandboxes.include?(sandbox)
      errors.add(:sandbox, "must belong to the jurisdiction")
    end
  end
end
