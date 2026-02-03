class Jurisdiction < ApplicationRecord
  extend FriendlyId
  friendly_id :qualified_name, use: :slugged
  include JurisdictionExternalApiState

  BASE_INCLUDES = %i[
    permit_type_submission_contacts
    contacts
    permit_type_required_steps
  ]

  include ActionView::Helpers::SanitizeHelper
  searchkick searchable: %i[
               name
               reverse_qualified_name
               qualified_name
               manager_emails
               ltsa_matcher
             ],
             word_start: %i[
               name
               reverse_qualified_name
               qualified_name
               manager_emails
               ltsa_matcher
             ],
             text_start: %i[
               name
               reverse_qualified_name
               qualified_name
               manager_emails
               ltsa_matcher
             ]

  SEARCH_DATA_FIELDS = %i[
    qualified_name
    reverse_qualified_name
    regional_district_name
    name
    type
    updated_at
    review_managers_size
    reviewers_size
    permit_applications_size
    user_ids
    inbox_enabled
    created_at
    ltsa_matcher
  ]
  SUPER_ADMIN_ADDITIONAL_DATA_FIELDS = %i[manager_emails]
  # Associations
  has_one :preference
  has_many :permit_projects
  has_many :permit_applications, through: :permit_projects
  has_many :contacts, as: :contactable, dependent: :destroy
  has_many :jurisdiction_memberships, dependent: :destroy
  has_many :users, through: :jurisdiction_memberships
  has_many :submitters, through: :permit_applications, source: :submitter
  has_many :jurisdiction_requirement_templates, dependent: :destroy
  has_many :enabled_requirement_templates,
           through: :jurisdiction_requirement_templates,
           source: :requirement_template
  has_many :jurisdiction_template_version_customizations
  has_many :template_versions,
           through: :jurisdiction_template_version_customizations
  has_many :requirement_templates, through: :template_versions
  has_many :permit_type_submission_contacts
  has_many :external_api_keys, dependent: :destroy
  has_many :integration_mappings
  has_many :permit_type_required_steps, dependent: :destroy
  has_many :collaborators, as: :collaboratorable, dependent: :destroy
  has_many :sandboxes, dependent: :destroy
  has_many :property_plan_local_jurisdictions, dependent: :destroy
  has_many :resources, dependent: :destroy
  has_many :service_partner_enrollments,
           class_name: "JurisdictionServicePartnerEnrollment",
           dependent: :destroy

  # Scopes
  scope :with_confirmed_submission_contacts,
        lambda {
          joins(:permit_type_submission_contacts)
            .where.not(permit_type_submission_contacts: { confirmed_at: nil })
            .distinct
        }

  validates :name, uniqueness: { scope: :locality_type, case_sensitive: false }
  validates :locality_type, presence: true
  validate :inbox_enabled_requires_inbox_setup

  # Validation to ensure at least one sandbox exists
  validate :must_have_one_sandbox

  # Callback to ensure default sandboxes exist
  before_validation :ensure_default_sandboxes

  before_validation :normalize_locality_type
  before_validation :normalize_name
  before_validation :set_type_based_on_locality
  before_validation :set_first_nation_flag, on: :create

  before_save :sanitize_html_fields

  after_create :create_permit_type_required_steps

  accepts_nested_attributes_for :contacts
  accepts_nested_attributes_for :permit_type_submission_contacts,
                                allow_destroy: true,
                                reject_if:
                                  proc { |attributes|
                                    attributes["email"].blank?
                                  }

  accepts_nested_attributes_for :permit_type_required_steps, allow_destroy: true
  accepts_nested_attributes_for :resources, allow_destroy: true

  before_create :assign_unique_prefix

  def customizations
    # Convenience method to prevent carpal tunnel syndrome
    jurisdiction_template_version_customizations
  end

  def regional_review_managers
    users&.kept&.regional_review_manager
  end

  def review_managers
    users&.kept&.review_manager
  end

  def managers
    review_managers + regional_review_managers
  end

  def manager_emails
    [
      review_managers&.pluck(:email),
      regional_review_manager_emails
    ].flatten.compact
  end

  def regional_review_manager_emails
    regional_review_managers&.pluck(:email)
  end

  def reviewers
    users&.kept&.reviewer
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
    find_by_sql("SELECT DISTINCT locality_type FROM jurisdictions").pluck(
      :locality_type
    )
  end

  def self.ltsa_matcher_from_ltsa_attributes(attributes)
    municipality = attributes["MUNICIPALITY"]
    regional_district = attributes["REGIONAL_DISTRICT"]
    is_regional_district = municipality == "Rural"
    is_regional_district ? regional_district : municipality
  end

  def self.fuzzy_find_by_ltsa_feature_attributes(attributes)
    ltsa_matcher = ltsa_matcher_from_ltsa_attributes(attributes)

    ltsa_matcher_params = {
      fields: %w[ltsa_matcher],
      misspellings: {
        edit_distance: 2
      }
    }
    is_regional_district = attributes["MUNICIPALITY"] == "Rural"

    return(
      if is_regional_district
        RegionalDistrict.search(ltsa_matcher, **ltsa_matcher_params).first
      else
        SubDistrict.search(ltsa_matcher, **ltsa_matcher_params).first
      end
    )
  end

  def search_data
    {
      qualified_name: qualified_name.upcase,
      reverse_qualified_name: reverse_qualified_name.upcase,
      regional_district_name: regional_district_name&.upcase,
      name: name,
      type: type,
      updated_at: updated_at,
      review_managers_size: review_managers_size,
      reviewers_size: reviewers_size,
      permit_applications_size: permit_applications_size,
      user_ids: users.pluck(:id),
      inbox_enabled: inbox_enabled,
      created_at: created_at,
      manager_emails: manager_emails,
      ltsa_matcher: ltsa_matcher
    }
  end

  def self.custom_titleize_locality_type(locality_type)
    locality_type
      .split
      .map do |word|
        %w[the of].include?(word.downcase) ? word.downcase : word.capitalize
      end
      .join(" ")
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

  def disambiguated_name
    disambiguator.present? ? "#{name} (#{disambiguator.titleize})" : name
  end

  def review_managers_size
    (review_managers&.size || 0) + (regional_review_managers&.size || 0)
  end

  def reviewers_size
    reviewers&.size || 0
  end

  def permit_applications_size
    permit_applications&.size || 0
  end

  def unviewed_submissions_count(sandbox: nil)
    permit_applications
      .for_sandbox(sandbox)
      .where(status: %i[newly_submitted resubmitted])
      .joins(:submission_versions)
      .where(submission_versions: { viewed_at: nil })
      .distinct
      .count
  end

  def unviewed_permit_applications
    permit_applications.unviewed
  end

  def submission_inbox_set_up
    # Preserve legacy behavior: if no permit types are enabled, setup is considered complete
    return true if PermitType.enabled.empty?

    permit_type_submission_contacts
      .where.not(email: nil)
      .where.not(confirmed_at: nil)
      .exists?
  end

  # Get confirmed submission contact emails for step code report sharing
  def confirmed_submission_emails
    permit_type_submission_contacts
      .where.not(confirmed_at: nil)
      .pluck(:email)
      .uniq
  end

  # Check if jurisdiction has any confirmed submission contacts
  def has_confirmed_submission_contacts?
    permit_type_submission_contacts.where.not(confirmed_at: nil).exists?
  end

  def self.class_for_locality_type(locality_type)
    if locality_type == RegionalDistrict.locality_type
      RegionalDistrict
    else
      SubDistrict
    end
  end

  def active_external_api_keys
    external_api_keys.active
  end

  def enabled_permit_type_required_steps()
    permit_type_required_steps.joins(:permit_type).where(
      permit_classifications: {
        enabled: true
      }
    )
  end

  def permit_type_required_steps_by_classification(permit_type = nil)
    return PermitTypeRequiredStep.none unless permit_type

    permit_type_required_steps.where(permit_type: permit_type)
  end

  def create_integration_mappings
    return unless external_api_enabled?

    existing_mapping_template_ids =
      integration_mappings.pluck(:template_version_id)

    relevant_template_versions =
      TemplateVersion
        .published
        .or(TemplateVersion.scheduled)
        .or(TemplateVersion.deprecated.where(deprecation_reason: "new_publish"))
        .where.not(id: existing_mapping_template_ids)
        .order(version_date: :asc)

    relevant_template_versions.each do |template_version|
      integration_mappings.create(template_version: template_version)
    end
  end

  def blueprint
    JurisdictionBlueprint
  end

  def template_version_customization(template_version, sandbox = nil)
    jurisdiction_template_version_customizations.find_by!(
      template_version_id: template_version.id,
      sandbox: sandbox
    )
  end

  private

  def create_permit_type_required_steps
    PermitType.all.each do |permit_type|
      permit_type_required_steps.create(
        permit_type:,
        energy_step_required: ENV["PART_9_MIN_ENERGY_STEP"],
        zero_carbon_step_required: ENV["PART_9_MIN_ZERO_CARBON_STEP"],
        default: true
      )
    end
  end

  def sanitize_html_fields
    attributes.each do |name, value|
      self[name] = sanitize(value) if name.ends_with?("_html") &&
        will_save_change_to_attribute?(name)
    end
  end

  def set_type_based_on_locality
    self.type =
      case locality_type
      when RegionalDistrict.locality_type
        "RegionalDistrict"
      else
        "SubDistrict"
      end
  end

  def set_first_nation_flag
    self.first_nation = locality_type == "first nation"
  end

  def normalize_name
    # Replace underscores with spaces
    normalized = name.gsub("_", " ")

    # Remove commas and periods
    normalized.gsub(/[,.]/, "")

    # Remove leading and trailing whitespaces
    normalized.strip!

    self.name = normalized
  end

  def normalize_locality_type
    # Convert to lowercase
    normalized = locality_type.downcase

    # Replace underscores with spaces
    normalized.gsub("_", " ")

    # Remove commas and periods
    normalized.gsub(/[,.]/, "")

    # Remove leading and trailing whitespaces
    normalized.strip!

    # Remove leading "the" or "of", case insensitive
    normalized.sub!(/\A(the|of)\s+/, "")

    # Remove trailing "the" or "of", case insensitive
    normalized.sub!(/\s+(the|of)\z/, "")

    self.locality_type = normalized
  end

  # Callback method to ensure a default sandbox is created
  def ensure_default_sandboxes
    if sandboxes.published.empty?
      sandboxes.build(
        name: "Published",
        description:
          "Work with application forms that have already been published",
        template_version_status_scope: :published
      )
    end
    if sandboxes.scheduled.empty?
      sandboxes.build(
        name: "Scheduled",
        description: "Work with application forms scheduled to be published",
        template_version_status_scope: :scheduled
      )
    end
  end

  # Custom validation method
  def must_have_one_sandbox
    if sandboxes.empty?
      errors.add(
        :base,
        I18n.t("activerecord.errors.models.jurisdiction.no_sandboxes")
      )
    end
  end

  def inbox_enabled_requires_inbox_setup
    if inbox_enabled && !submission_inbox_set_up
      errors.add(
        :inbox_enabled,
        I18n.t(
          "activerecord.errors.models.jurisdiction.enabled_inbox_requires_setup"
        )
      )
    end
  end

  def enrolled_in_service_partner?(partner)
    service_partner_enrollments.exists?(service_partner: partner, enabled: true)
  end

  def archistar_enabled?
    enrolled_in_service_partner?(:archistar)
  end
end
