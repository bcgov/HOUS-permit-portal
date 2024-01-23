class Jurisdiction < ApplicationRecord
  searchkick searchable: %i[reverse_qualified_name], word_start: %i[reverse_qualified_name]

  # Associations
  has_many :permit_applications
  has_many :contacts, dependent: :destroy
  has_many :users, dependent: :destroy
  has_many :submitters, through: :permit_applications, source: :submitter
  has_many :jurisdiction_requirement_templates
  has_many :requirement_templates, through: :jurisdiction_requirement_templates

  validates :name, uniqueness: { scope: :locality_type }
  validates :locality_type, presence: true

  before_validation :set_type_based_on_locality

  def review_managers
    users.review_managers
  end

  def reviewers
    users.reviewers
  end

  def self.locality_types
    find_by_sql("SELECT DISTINCT locality_type FROM jurisdictions").pluck(:locality_type)
  end

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

  def self.custom_titleize_locality_type(locality_type)
    locality_type.split.map { |word| %w[the of].include?(word.downcase) ? word.downcase : word.capitalize }.join(" ")
  end

  def qualifier
    "#{Jurisdiction.custom_titleize_locality_type(locality_type)} of"
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

  def set_type_based_on_locality
    case locality_type
    when RegionalDistrict.locality_type
      self.type = "RegionalDistrict"
    else
      self.type = "SubDistrict"
    end
  end
end
