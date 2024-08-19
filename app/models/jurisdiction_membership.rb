class JurisdictionMembership < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :user

  after_commit :reindex_jurisdiction, on: %i[create update destroy]
  after_commit :create_jurisdiction_collaborator, on: %i[create update]
  after_commit :destroy_jurisdiction_collaborator, on: %i[destroy]

  private

  def create_jurisdiction_collaborator
    return unless user.review_staff? && user.kept?

    existing_collaborator = jurisdiction.collaborators.find_by(user_id: user.id)

    return if existing_collaborator.present?

    jurisdiction.collaborators.create(user: user)
  end

  def destroy_jurisdiction_collaborator
    existing_collaborator = jurisdiction.collaborators.find_by(user_id: user.id)

    return unless existing_collaborator.present?

    existing_collaborator.destroy
  end

  def reindex_jurisdiction
    jurisdiction.reindex
  end
end
