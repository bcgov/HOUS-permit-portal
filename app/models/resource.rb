class Resource < ApplicationRecord
  belongs_to :jurisdiction, inverse_of: :resources
  has_one :resource_document, dependent: :destroy

  enum category: {
         planning_zoning: "planning_zoning",
         bylaws_requirements: "bylaws_requirements",
         gis_mapping: "gis_mapping",
         additional_resources: "additional_resources"
       }

  enum resource_type: { file: "file", link: "link" }

  validates :jurisdiction, presence: true
  validates :category, presence: true
  validates :title, presence: true
  validates :resource_type, presence: true
  validates :link_url, presence: true, if: -> { resource_type == "link" }
  validate :resource_document_must_exist_for_file_type

  accepts_nested_attributes_for :resource_document, allow_destroy: true

  scope :by_category, ->(category) { where(category: category) }

  private

  def resource_document_must_exist_for_file_type
    return unless resource_type == "file"

    # Check if resource_document exists or is being built via nested attributes
    # When nested attributes are provided via resource_document_attributes=,
    # Rails builds the association before validation runs, so resource_document
    # will be present even if it's a new record
    if resource_document.present? && !resource_document.marked_for_destruction?
      return
    end

    errors.add(:base, "Resource document must exist for file type resources")
  end

  def self.resource_reminder_notification_data(jurisdiction_id, resource_ids)
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::RESOURCE_REMINDER,
      "action_text" => I18n.t("notification.resource.reminder"),
      "object_data" => {
        "jurisdiction_id" => jurisdiction_id,
        "resource_ids" => resource_ids
      }
    }
  end
end
