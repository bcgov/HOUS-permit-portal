class RevisionRequest < ApplicationRecord
  include PublicRecordable

  belongs_to :submission_version
  belongs_to :user, optional: true
  public_recordable user_association: :user
  belongs_to :revision_reason,
             foreign_key: :reason_code,
             primary_key: :reason_code,
             optional: true

  has_many :revision_reference_documents,
           dependent: :destroy,
           inverse_of: :revision_request
  has_many :supporting_documents,
           dependent: :destroy,
           inverse_of: :revision_request
  accepts_nested_attributes_for :revision_reference_documents,
                                allow_destroy: true

  validate :user_must_be_review_staff

  def public_record?
    true
  end

  private

  def user_must_be_review_staff
    return if user_id.blank?

    unless user.review_staff?
      errors.add(
        :user,
        I18n.t(
          "activerecord.errors.models.revision_request.attributes.user.incorrect_role"
        )
      )
    end
  end
end
