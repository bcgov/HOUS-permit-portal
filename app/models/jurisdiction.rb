class Jurisdiction < ApplicationRecord
  searchkick searchable: %i[reverse_qualified_name], word_start: %i[reverse_qualified_name]

  # Associations
  has_many :permit_applications
  has_many :contacts, dependent: :destroy
  has_many :review_managers, -> { where(role: User.roles[:review_manager]) }, class_name: "User"
  has_many :reviewers, -> { where(role: User.roles[:reviewer]) }, class_name: "User"
  has_many :submitters, through: :permit_applications, source: :submitter

  validates :name, uniqueness: { scope: :locality_type }
  validates :locality_type, presence: true
  validate :has_correct_locality_type

  def search_data
    {
      reverse_qualified_name: reverse_qualified_name,
      updated_at: updated_at,
      review_managers_size: review_managers_size,
      reviewers_size: reviewers_size,
      permit_applications_size: permit_applications_size,
      # templates_used: "TODO",
    }
  end

  def users
    review_managers + reviewers
  end

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

  private

  def has_correct_locality_type
    raise NotImplementedError, "Regional and Sub districts implement this method"
  end
end
