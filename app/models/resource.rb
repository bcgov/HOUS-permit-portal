class Resource < ApplicationRecord
  belongs_to :jurisdiction, inverse_of: :resources
  has_one :resource_document, dependent: :destroy

  enum category: {
         planning_zoning: "planning_zoning",
         bylaws_requirements: "bylaws_requirements",
         gis_mapping: "gis_mapping",
         additional_resources: "additional_resources",
         project_meeting_authorization: "project_meeting_authorization"
       }

  enum resource_type: { file: "file", link: "link" }

  attribute :show_on_about, :boolean, default: true

  validates :jurisdiction, presence: true
  validates :category, presence: true
  validates :title, presence: true
  validates :resource_type, presence: true
  validates :link_url, presence: true, if: -> { resource_type == "link" }
  validate :resource_document_must_exist_for_file_type

  accepts_nested_attributes_for :resource_document, allow_destroy: true

  before_validation :assign_about_position, on: :create

  scope :by_category, ->(category) { where(category: category) }
  scope :on_about, -> { where(show_on_about: true).order(:about_position) }

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

  private

  def assign_about_position
    return unless about_position.nil?
    return unless jurisdiction

    self.about_position =
      (jurisdiction.resources.maximum(:about_position) || -1) + 1
  end

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
end
