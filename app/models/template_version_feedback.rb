class TemplateVersionFeedback < ApplicationRecord
  belongs_to :template_version
  belongs_to :user
  belongs_to :resolved_by, class_name: "User", optional: true

  enum :sentiment,
       { approve: 0, request_changes: 1, comment: 2 },
       default: :comment

  validates :body, presence: true
  validates :template_version, presence: true
  validates :user, presence: true

  validate :template_version_must_be_draft

  scope :unresolved, -> { where(resolved: false) }
  scope :resolved, -> { where(resolved: true) }

  def resolve!(resolver)
    update!(resolved: true, resolved_by: resolver)
  end

  def unresolve!
    update!(resolved: false, resolved_by: nil)
  end

  private

  def template_version_must_be_draft
    return if template_version.blank?

    unless template_version.draft?
      errors.add(
        :template_version,
        "must be a draft version to receive feedback"
      )
    end
  end
end
