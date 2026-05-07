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

  scope :published, -> { where(status: :published) }
end
