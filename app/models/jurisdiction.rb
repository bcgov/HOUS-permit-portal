class Jurisdiction < ApplicationRecord
  # Associations
  has_many :permit_applications
  has_many :contacts, dependent: :destroy
  has_many :review_managers, -> { where(role: User.roles[:review_manager]) }, class_name: "User"
  has_many :reviewers, -> { where(role: User.roles[:reviewer]) }, class_name: "User"
  has_many :submitters, through: :permit_applications, source: :submitter

  validates :name, uniqueness: { scope: :locality_type }

  def qualifier
    "The #{locality_type.titleize} Of"
  end

  def qualified_name
    "#{qualifier} #{name}"
  end

  def reverse_qualified_name
    "#{name}, #{qualifier}"
  end
end
