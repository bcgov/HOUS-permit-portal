class Collaborator < ApplicationRecord
  searchkick searchable: %i[first_name last_name email],
             word_start: %i[first_name last_name email]

  belongs_to :user
  belongs_to :jurisdiction

  has_many :permit_collaborations, dependent: :destroy
  has_many :permit_project_collaborations, dependent: :destroy

  validates :user, uniqueness: { scope: :jurisdiction_id }

  validate :validate_user, on: :create

  # ponytail: collaboratorable stays NOT NULL until HUB-5783 drops it.
  # New roster rows only know jurisdiction_id; mirror it so inserts succeed.
  # Remove this callback when those columns go.
  before_create :mirror_jurisdiction_collaboratorable

  after_save :reindex_permit_applications

  def search_data
    {
      jurisdiction_id: jurisdiction_id,
      updated_at: user.updated_at,
      created_at: user.created_at,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      jurisdiction_ids: user.jurisdictions.pluck(:id),
      discarded: user.discarded_at.present?
    }
  end

  private

  def reindex_permit_applications
    return unless saved_change_to_user_id

    permit_applications =
      permit_collaborations
        .kept
        .includes(:permit_application)
        .map(&:permit_application)
        .uniq

    permit_applications.each(&:reindex)
  end

  def mirror_jurisdiction_collaboratorable
    return if jurisdiction_id.blank?

    self.collaboratorable_type ||= "Jurisdiction"
    self.collaboratorable_id ||= jurisdiction_id
  end

  def validate_user
    return if user.blank?
    if user.review_staff? &&
         user.jurisdictions.find_by(id: jurisdiction_id).present?
      return
    end

    errors.add(:user, :incorrect_jurisdiction)
  end
end
