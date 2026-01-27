class RevisionRequest < ApplicationRecord
  include PublicRecordable

  belongs_to :submission_version
  belongs_to :user, optional: true
  public_recordable user_association: :user
  belongs_to :revision_reason,
             foreign_key: :reason_code,
             primary_key: :reason_code,
             optional: true

  validate :user_must_be_review_staff

  def public_record?
    true
  end

  private

  def user_must_be_review_staff
    unless user&.review_staff?
      errors.add(
        :user,
        I18n.t(
          "activerecord.errors.models.revision_request.attributes.user.incorrect_role"
        )
      )
    end
  end
end
