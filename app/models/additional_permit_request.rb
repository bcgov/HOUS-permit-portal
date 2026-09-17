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
