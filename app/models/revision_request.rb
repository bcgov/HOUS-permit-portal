class RevisionRequest < ApplicationRecord
  belongs_to :submission_version
  belongs_to :user
  belongs_to :revision_reason,
             foreign_key: :reason_code,
             primary_key: :reason_code,
             optional: true

  validate :user_must_be_review_staff

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
