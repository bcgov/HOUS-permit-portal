class SupportingInformationRequest < ApplicationRecord
  include PublicRecordable

  belongs_to :submission_version, inverse_of: :supporting_information_requests
  belongs_to :user, optional: true
  public_recordable user_association: :user

  has_many :project_documents,
           dependent: :destroy,
           inverse_of: :supporting_information_request
  accepts_nested_attributes_for :project_documents, allow_destroy: true

  validates :title, presence: true
  validate :user_must_be_review_staff

  before_validation :assign_project_document_defaults

  def public_record?
    true
  end

  private

  def assign_project_document_defaults
    project = submission_version&.permit_application&.permit_project
    project_documents.each do |doc|
      doc.permit_project ||= project
      doc.kind = :reference if doc.kind.blank?
      doc.uploaded_by ||= user
    end
  end

  def user_must_be_review_staff
    return if user_id.blank?

    unless user.review_staff?
      errors.add(
        :user,
        I18n.t(
          "activerecord.errors.models.supporting_information_request.attributes.user.incorrect_role"
        )
      )
    end
  end
end
