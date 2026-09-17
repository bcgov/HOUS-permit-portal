class AdditionalPermitRequest < ApplicationRecord
  include PublicRecordable

  belongs_to :submission_version, inverse_of: :additional_permit_requests
  belongs_to :user, optional: true
  public_recordable user_association: :user
  belongs_to :requirement_template

  validates :requirement_template, presence: true
  validates :name_snapshot, presence: true
  validates :requirement_template_id,
            uniqueness: {
              scope: :submission_version_id
            }
  validate :user_must_be_review_staff

  before_validation :set_name_snapshot

  def public_record?
    true
  end

  # UX DISCUSSION ASSUMPTION: #4 request-only (no auto-create); #7 allow already-on-project duplicates.
  # Guess: chip = latest sibling of that template, else Not started.
  # Lapse: chip can stay Not started forever; multiple matches are a guess.
  def sibling_application
    project = submission_version&.permit_application&.permit_project
    current_id = submission_version&.permit_application_id
    return if project.blank?

    project
      .permit_applications
      .kept
      .where.not(id: current_id)
      .joins(:template_version)
      .where(
        template_versions: {
          requirement_template_id: requirement_template_id
        }
      )
      .order(updated_at: :desc)
      .first
  end

  private

  def set_name_snapshot
    return if name_snapshot.present?

    self.name_snapshot = requirement_template&.nickname
  end

  def user_must_be_review_staff
    return if user_id.blank?

    unless user.review_staff?
      errors.add(
        :user,
        I18n.t(
          "activerecord.errors.models.additional_permit_request.attributes.user.incorrect_role"
        )
      )
    end
  end
end
