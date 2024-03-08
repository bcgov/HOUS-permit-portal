class Jurisdiction < ApplicationRecord
  include ActionView::Helpers::SanitizeHelper
  searchkick searchable: %i[reverse_qualified_name qualified_name],
             word_start: %i[reverse_qualified_name qualified_name],
             word_middle: %i[reverse_qualified_name qualified_name],
             word_end: %i[reverse_qualified_name qualified_name]

  # Associations
  has_many :permit_applications
  has_many :contacts, dependent: :destroy
  has_many :users, dependent: :destroy
  has_many :submitters, through: :permit_applications, source: :submitter
  has_many :jurisdiction_template_version_customizations
  has_many :template_versions, through: :jurisdiction_template_version_customizations
  has_many :requirement_templates, through: :template_versions

  validates :name, uniqueness: { scope: :locality_type }
  validates :locality_type, presence: true

  before_validation :set_type_based_on_locality
  before_save :sanitize_html_fields

  accepts_nested_attributes_for :contacts

  before_create :assign_unique_prefix

  def review_managers
    users.review_managers
  end

  def reviewers
    users.reviewers
  end

  def assign_unique_prefix
    # Initial prefix from the first letter of the qualifier and the name
    prefix_base = "#{qualifier.first}#{name.first.capitalize}"
    prefix = prefix_base
    counter = 1

    # Loop until a unique prefix is found
    while Jurisdiction.exists?(prefix: prefix)
      next_letter = name[counter] || ""
      prefix = "#{prefix_base}#{next_letter.capitalize}"
      counter += 1
    end

    # Update the jurisdiction with the unique prefix
    self.prefix = prefix
  end

  def self.locality_types
    find_by_sql("SELECT DISTINCT locality_type FROM jurisdictions").pluck(:locality_type)
  end

  def self.fuzzy_find_by_ltsa_feature_attributes(attributes)
    name = attributes["MUNICIPALITY"]
    regional_district_name = attributes["REGIONAL_DISTRICT"]

    named_params = { fields: %w[reverse_qualified_name qualified_name], misspellings: { edit_distance: 1 } }
    return(
      SubDistrict.search(name, **named_params).first ||
        RegionalDistrict.search(regional_district_name, **named_params).first
    )
  end

  def search_data
    {
      qualified_name: qualified_name,
      reverse_qualified_name: reverse_qualified_name,
      type: type,
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

  def sanitize_html_fields
    attributes.each do |name, value|
      self[name] = sanitize(value) if name.ends_with?("_html") && will_save_change_to_attribute?(name)
    end
  end

  def set_type_based_on_locality
    case locality_type
    when RegionalDistrict.locality_type
      self.type = "RegionalDistrict"
    else
      self.type = "SubDistrict"
    end
  end
end
