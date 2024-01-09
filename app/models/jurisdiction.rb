class Jurisdiction < ApplicationRecord
  # Associations
  has_many :permit_applications
  has_many :contacts, dependent: :destroy
  has_many :review_managers, -> { where(role: User.roles[:review_manager]) }, class_name: "User"
  has_many :reviewers, -> { where(role: User.roles[:reviewer]) }, class_name: "User"
  has_many :submitters, through: :permit_applications, source: :submitter

  validates :name, uniqueness: { scope: :locality_type }
  validates :locality_type, presence: true

  def qualifier
    custom_titleized_locality_type =
      locality_type.split.map { |word| %w[the of].include?(word.downcase) ? word.downcase : word.capitalize }.join(" ")
    "#{custom_titleized_locality_type} of"
  end

  def qualified_name
    "#{qualifier} #{name}"
  end

  def reverse_qualified_name
    "#{name}, #{qualifier}"
  end

  def review_managers_size
    review_managers.size
  end

  def reviewers_size
    reviewers.size
  end

  def permit_applications_size
    permit_applications.size
  end
end
