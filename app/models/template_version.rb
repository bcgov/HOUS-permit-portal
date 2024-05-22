class TemplateVersion < ApplicationRecord
  include TraverseDataJson
  belongs_to :requirement_template
  has_many :jurisdiction_template_version_customizations
  has_many :permit_applications

  delegate :permit_type, to: :requirement_template
  delegate :activity, to: :requirement_template
  delegate :label, to: :requirement_template
  delegate :published_template_version, to: :requirement_template

  enum status: { scheduled: 0, published: 1, deprecated: 2 }, _default: 0

  after_save :reindex_requirement_template_if_published, if: :status_changed?

  def lookup_props
    #form_json starts at root template
    flatten_requirements_from_form_hash(form_json)
  end

  def publish_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::NEW_TEMPLATE_VERSION_PUBLISH,
      "action_text" => "#{label} - #{I18n.t("notification.template_version.new_version_notification")}",
      "object_data" => {
        "template_version_id" => id,
      },
    }
  end

  def previous_version
    requirement_template
      .template_versions
      .where("version_date <=?", version_date)
      .where.not(id: id)
      .order(version_date: :desc, created_at: :desc)
      .first
  end

  def compare_requirements(before_json)
    before_json ||= previous_version&.requirement_blocks_json
    after_json = requirement_blocks_json

    before_requirements = before_json&.values&.flat_map { |block| block["requirements"] }
    after_requirements = after_json&.values&.flat_map { |block| block["requirements"] }

    after_requirements_components = after_json&.values&.flat_map { |block| block["form_json"]["components"] } || []

    before_requirements_components = before_json&.values&.flat_map { |block| block["form_json"]["components"] } || []

    before_ids = before_requirements&.map { |req| req["id"] } || []
    after_ids = after_requirements&.map { |req| req["id"] } || []

    added_ids = after_ids - before_ids
    removed_ids = before_ids - after_ids
    intersection_ids = before_ids & after_ids
    changed_ids =
      intersection_ids.select do |id|
        before_req = before_requirements.find { |req| req["id"] == id }.reject { |key, _| key == "updated_at" }
        after_req = after_requirements.find { |req| req["id"] == id }.reject { |key, _| key == "updated_at" }
        before_req != after_req
      end

    added_requirement_blueprints = after_requirements&.select { |req| added_ids.include?(req["id"]) } || []
    removed_requirement_blueprints = before_requirements&.select { |req| removed_ids.include?(req["id"]) } || []
    changed_requirement_blueprints = after_requirements&.select { |req| changed_ids.include?(req["id"]) } || []

    # Workaround: need to add the fully formed form_json into the requirement blueprint
    (changed_requirement_blueprints + added_requirement_blueprints + removed_requirement_blueprints).each do |blueprint|
      matching_component =
        (after_requirements_components + before_requirements_components).find do |component|
          component["id"] == blueprint["id"]
        end

      blueprint["form_json"] = matching_component if matching_component
    end

    {
      added: added_requirement_blueprints,
      removed: removed_requirement_blueprints,
      changed: changed_requirement_blueprints,
    }
  end

  private

  def reindex_requirement_template_if_published
    reindex_requirement_template if published?
  end
  def reindex_requirement_template
    requirement_template.reindex
  end
end
