class ReleaseNote < ApplicationRecord
  include ValidateUrlAttributes

  # https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  SEMVER_REGEX =
    /\A(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?\z/

  enum :status, { draft: 0, published: 1 }, default: :draft
  enum :release_type,
       { software: "software", content: "content" },
       validate: true

  url_validatable :release_notes_url

  before_validation :clear_inactive_type_specific_attributes

  validates :release_date, :content, :release_type, presence: true
  validate :release_type_immutable_once_persisted

  validates :version,
            presence: true,
            uniqueness: {
              conditions: -> { where(release_type: :software) }
            },
            format: {
              with: SEMVER_REGEX
            },
            if: :software?
  validates :release_notes_url, presence: true, if: :software?
  validate :version_unchanged_once_published, if: :software?

  validates :name, presence: true, if: :content?

  scope :published, -> { where(status: :published) }

  searchkick

  after_commit :refresh_release_note_search_index, on: %i[create update]

  def search_data
    {
      id: id,
      content: content,
      release_date: release_date,
      status: status,
      created_at: created_at,
      updated_at: updated_at,
      release_type: release_type,
      version: version,
      name: name,
      release_notes_url: release_notes_url
    }
  end

  def display_label
    software? ? version : name
  end

  def publish_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::RELEASE_NOTE_PUBLISH,
      "action_text" =>
        I18n.t(
          "notification.release_note.publish_notification.#{release_type}",
          label: display_label
        ),
      "object_data" => {
        "release_note_id" => id,
        "release_type" => release_type,
        "label" => display_label
      }
    }
  end

  private

  def clear_inactive_type_specific_attributes
    if software?
      self.name = nil
    elsif content?
      self.version = nil
      self.release_notes_url = nil
    end
  end

  def release_type_immutable_once_persisted
    return unless persisted? && release_type_changed?

    errors.add(:release_type, "cannot be changed once a release note is saved")
  end

  def version_unchanged_once_published
    return unless persisted? && status_was == "published" && version_changed?

    errors.add(:version, "cannot be changed once a release note is published")
  end

  def refresh_release_note_search_index
    ReleaseNote.search_index.refresh
  end
end
