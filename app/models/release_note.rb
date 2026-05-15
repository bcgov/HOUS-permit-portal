class ReleaseNote < ApplicationRecord
  include ValidateUrlAttributes

  # https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  SEMVER_REGEX =
    /\A(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?\z/
  enum :status, { draft: 0, published: 1 }, default: :draft

  url_validatable :release_notes_url
  validates :version,
            presence: true,
            uniqueness: true,
            format: {
              with: SEMVER_REGEX
            }

  validates :release_date, :content, :release_notes_url, presence: true
  validate :version_unchanged_once_published

  scope :published, -> { where(status: :published) }

  def publish_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::RELEASE_NOTE_PUBLISH,
      "action_text" =>
        I18n.t(
          "notification.release_note.publish_notification",
          version: version
        ),
      "object_data" => {
        "release_note_id" => id,
        "version" => version
      }
    }
  end

  private

  def version_unchanged_once_published
    return unless persisted? && status_was == "published" && version_changed?

    errors.add(:version, "cannot be changed once a release note is published")
  end
end
