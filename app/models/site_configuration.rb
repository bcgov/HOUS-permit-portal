class SiteConfiguration < ApplicationRecord
  # Ensures that only one SiteConfiguration record can be created
  before_create :ensure_single_record
  validate :validate_help_link_items

  HELP_LINK_KEYS = %w[get_started_link_item best_practices_link_item dictionary_link_item user_guide_link_item]

  def self.instance
    first_or_create
  end

  private

  # A private method to ensure only one record exists
  def ensure_single_record
    if SiteConfiguration.count > 0
      errors.add(:base, I18n.t("activerecord.errors.models.site_configuration.single_record"))
    end
  end

  def validate_help_link_items
    return unless help_link_items.present?

    help_link_items.each do |key, item|
      # Check if item should show
      if item["show"]
        unless item["href"].present? && item["title"].present? && item["description"].present?
          errors.add(
            :base,
            I18n.t("activerecord.errors.models.site_configuration.attributes.help_link_items.incomplete", link: key),
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
              I18n.t("activerecord.errors.models.site_configuration.attributes.help_link_items.invalid_url", link: key),
            )
          end
        rescue URI::InvalidURIError
          errors.add(
            :base,
            I18n.t("activerecord.errors.models.site_configuration.attributes.help_link_items.invalid_url", link: key),
          )
        end
      end
    end
  end
end
