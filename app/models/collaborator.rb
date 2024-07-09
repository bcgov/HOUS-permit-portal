class Collaborator < ApplicationRecord
  belongs_to :user
  belongs_to :collaboratorable, polymorphic: true

  has_many :permit_collaborations, dependent: :destroy

  validates :collaboratorable_type, inclusion: { in: %w[User Jurisdiction] }
end
