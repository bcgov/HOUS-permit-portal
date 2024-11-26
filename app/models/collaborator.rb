class Collaborator < ApplicationRecord
  searchkick searchable: %i[first_name last_name email],
             word_start: %i[first_name last_name email]

  belongs_to :user
  belongs_to :collaboratorable, polymorphic: true

  has_many :permit_collaborations, dependent: :destroy

  validates :collaboratorable_type, inclusion: { in: %w[User Jurisdiction] }
  validates :user,
            uniqueness: {
              scope: %i[collaboratorable_id collaboratorable_type]
            }

  validate :validate_user, on: :create

  after_save :reindex_permit_applications

  def search_data
    {
      collaboratorable_type: collaboratorable_type,
      collaboratorable_id: collaboratorable_id,
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
        .includes(:permit_application)
        .map(&:permit_application)
        .uniq

    permit_applications.each(&:reindex)
  end

  def validate_user
    error_key = nil
    if collaboratorable.is_a? Jurisdiction
      error_key = :incorrect_jurisdiction unless user.review_staff? &&
        user.jurisdictions.find_by(id: collaboratorable.id).present?
    elsif collaboratorable.is_a? User
      error_key =
        if user == collaboratorable
          :incorrect_user
        elsif !user.submitter?
          :submission_collaborator_must_be_submitter
        end
    end

    errors.add(:user, error_key) unless error_key.nil?
  end
end
