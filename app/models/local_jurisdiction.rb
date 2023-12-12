class LocalJurisdiction < ApplicationRecord
  # Associations
  has_many :permit_applications
  has_many :contacts
  has_many :review_managers, -> { where(role: User.roles[:review_manager]) }, class_name: "User"
  has_many :reviewers, -> { where(role: User.roles[:reviewer]) }, class_name: "User"

  has_many :submitters, through: :permit_applications, source: :submitter
end
