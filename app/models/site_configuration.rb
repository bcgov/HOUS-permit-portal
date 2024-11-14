class SiteConfiguration < ApplicationRecord
  # Ensures that only one SiteConfiguration record can be created
  before_create :ensure_single_record
  validate :validate_help_link_items

  has_many :revision_reasons

  belongs_to :small_scale_requirement_template,
             class_name: "RequirementTemplate",
             optional: true

  # In the future, add new landing page templates like so:
  # belongs_to :medium_scale_requirement_template,
  #            class_name: "RequirementTemplate",
  #            optional: true

  # belongs_to :large_scale_requirement_template,
  #            class_name: "RequirementTemplate",
  #            optional: true

  accepts_nested_attributes_for :revision_reasons, allow_destroy: true
  validate :max_undiscarded_revision_reasons
  validate :max_revision_reasons

  HELP_LINK_KEYS = %w[
    get_started_link_item
    best_practices_link_item
    dictionary_link_item
    user_guide_link_item
  ]

  def self.instance
    first_or_create
  end

  # This override allows discarding of reasons and updating them by reason_code
  # if a discarded reason of a particular code is found and updated, it will be undiscarded.
  def revision_reasons_attributes=(attributes)
    attributes.each do |attribute, _|
      next unless attribute["id"].blank? && attribute["reason_code"].present?

      existing_reason =
        self.revision_reasons.with_discarded.find_by(
          reason_code: attribute["reason_code"]
        )

      next unless existing_reason.present?

      # Undiscard and update the record
      attribute["id"] = existing_reason.id
      attribute["discarded_at"] = nil
    end

    super(attributes)
  end

  private

  def max_revision_reasons
    if revision_reasons.count > 200
      errors.add(
        :revision_reasons,
        I18n.t(
          "activerecord.errors.models.site_configuration.attributes.revision_reasons.max_records"
        )
      )
    end
  end

  def max_undiscarded_revision_reasons
    if revision_reasons.kept.count > 20
      errors.add(
        :revision_reasons,
        I18n.t(
          "activerecord.errors.models.site_configuration.attributes.revision_reasons.max_undiscarded_records"
        )
      )
    end
  end

  # A private method to ensure only one record exists
  def ensure_single_record
    if SiteConfiguration.count > 0
      errors.add(
        :base,
        I18n.t("activerecord.errors.models.site_configuration.single_record")
      )
    end
  end

  def validate_help_link_items
    return unless help_link_items.present?

    help_link_items.each do |key, item|
      # Check if item should show
      if item["show"]
        unless item["href"].present? && item["title"].present? &&
                 item["description"].present?
          errors.add(
            :base,
            I18n.t(
              "activerecord.errors.models.site_configuration.attributes.help_link_items.incomplete",
              link: key
            )
          )
        end
      end

      # Check if href is a valid URL using the same logic as validate_url_attributes
      if item["href"].present?
        begin
          uri = URI.parse(item["href"])
          unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
            errors.add(
              :base,
              I18n.t(
                "activerecord.errors.models.site_configuration.attributes.help_link_items.invalid_url",
                link: key
              )
            )
          end
        rescue URI::InvalidURIError
          errors.add(
            :base,
            I18n.t(
              "activerecord.errors.models.site_configuration.attributes.help_link_items.invalid_url",
              link: key
            )
          )
        end
      end
    end
  end
end
