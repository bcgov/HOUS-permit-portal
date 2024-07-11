class RevisionRequest < ApplicationRecord
  belongs_to :submission_version
  belongs_to :user

  enum reason_code: {
         non_compliant: 0,
         conflicting_inaccurate: 1,
         insufficient_detail: 2,
         incorrect_format: 3,
         missing_documentation: 4,
         outdated: 5,
         inapplicable: 6,
         missing_signatures: 7,
         incorrect_calculations: 8,
         other: 9,
       },
       _default: 0

  validate :user_must_be_review_staff

  private

  def user_must_be_review_staff
    unless user&.review_staff?
      errors.add(:user, I18n.t("errors.models.revision_request.attributes.user.incorrect_role"))
    end
  end
end
