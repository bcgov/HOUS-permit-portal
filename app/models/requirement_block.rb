class RequirementBlock < ApplicationRecord
  include HtmlSanitizeAttributes
  include Discard::Model

  sanitizable :display_description
  searchkick searchable: %i[
               name
               requirement_labels
               associations
               configurations
             ],
             word_start: %i[name requirement_labels associations configurations]

  has_many :requirements, -> { order(position: :asc) }, dependent: :destroy

  has_many :template_section_blocks, dependent: :destroy
  has_many :requirement_template_sections, through: :template_section_blocks

  accepts_nested_attributes_for :requirements, allow_destroy: true

  enum sign_off_role: { any: 0 }, _prefix: true
  enum reviewer_role: { any: 0 }, _prefix: true
  enum visibility: { any: 0, early_access: 1, live: 2 }, _default: 0

  validates :sku, uniqueness: true, presence: true
  validates :name, presence: true, uniqueness: { scope: :first_nations }
  validates :display_name, presence: true
  validate :validate_step_code_dependencies
  validate :validate_requirements_conditional
  validate :early_access_on_appropriate_template

  before_validation :set_sku, on: :create
  before_validation :ensure_unique_name, on: :create

  after_commit :refresh_search_index,
               if: -> do
                 saved_change_to_discarded_at? || saved_change_to_visibility?
               end

  acts_as_taggable_on :associations

  after_discard { template_section_blocks.destroy_all }

  def sections
    requirement_template_sections
  end

  def search_data
    {
      updated_at: updated_at,
      name: name,
      first_nations: first_nations,
      requirement_labels: requirements.pluck(:label),
      associations: association_list,
      configurations: configurations_search_list,
      discarded: discarded_at.present?,
      visibility: visibility
    }
  end

  def key(section_key = nil)
    "formSubmissionDataRST#{section_key}|RB#{id}"
  end

  def to_form_json(section_key = nil)
    {
      id: id,
      key: key(section_key),
      type: "panel",
      title: name,
      description: display_description,
      collapsible: true,
      collapsed: false,
      components: components_form_json(section_key)
    }
  end

  def components_form_json(section_key)
    optional_block = requirements.all? { |req| !req.required }
    requirement_map = requirements.map { |r| r.to_form_json(key(section_key)) }

    if optional_block
      requirement_map.push(optional_block_confirmation_requirement(section_key))
    end

    requirement_map
  end

  def optional_block_confirmation_requirement(section_key)
    {
      id: "#{id}-confirmation",
      key: "#{key(section_key)}|confirmation",
      type: "checkbox",
      custom_class: "optional-block-confirmation-checkbox",
      validate: {
        required: true
      },
      input: true,
      label:
        I18n.t(
          "formio.requirement_block.optional_block_confirmation_requirement_label"
        ),
      widget: {
        type: "input"
      }
    }
  end

  private

  def early_access_on_appropriate_template
    # Determine the required visibility based on the current object's state
    if early_access?
      required_visibility = :early_access
      error_key = "associated_requirement_templates_must_be_early_access"
    elsif live?
      required_visibility = :live
      error_key = "associated_requirement_templates_must_be_live"
    elsif any?
      # If any, no validation is needed
      return
    end

    # Fetch associated requirement templates through requirement_template_sections
    associated_templates =
      requirement_template_sections.map(&:requirement_template)

    method_to_use = :"#{required_visibility}?"

    # Check if all associated templates satisfy the required visibility
    unless associated_templates.all?(&method_to_use)
      errors.add(
        :visibility,
        I18n.t(
          "activerecord.errors.models.requirement_block.attributes.visibility.#{error_key}"
        )
      )
    end
  end

  def refresh_search_index
    RequirementBlock.search_index.refresh
  end

  def validate_requirements_conditional
    requirements.each do |requirement|
      conditional = requirement.input_options["conditional"]

      next unless conditional.present?

      if [conditional["when"], conditional["eq"], conditional["show"]].any?(
           &:blank?
         )
        errors.add(:input_options, "conditional must have when, eq, and show")
        break
      end

      if requirements
           .find { |r| r.requirement_code == conditional["when"] }
           .blank?
        errors.add(
          :input_options,
          "conditional 'when' field must be a requirement code in the same requirement block"
        )
        break
      end
    end
  end

  def validate_step_code_dependencies
    has_energy_step_code =
      requirements.any? { |req| req.input_type_energy_step_code? }

    return unless has_energy_step_code

    has_all_dependencies =
      Requirement::ENERGY_STEP_CODE_REQUIRED_DEPENDENCY_CODES.all? do |dependency_code|
        requirements.count { |req| req.requirement_code == dependency_code } ==
          1
      end

    return if has_all_dependencies

    errors.add(:requirements, :incorrect_energy_step_code_dependencies)
  end

  def configurations_search_list
    configurations = []
    has_any_elective = requirements.any?(&:elective?)
    has_any_conditional = requirements.any?(&:has_conditional?)
    has_any_data_validation = requirements.any?(&:has_data_validation?)
    has_any_computed_compliance = requirements.any?(&:computed_compliance?)

    configurations << "elective" if has_any_elective
    configurations << "conditional" if has_any_conditional
    configurations << "data_validation" if has_any_data_validation
    configurations << "automated_compliance" if has_any_computed_compliance

    configurations
  end

  # sku should be auto generated, readable and unique.
  def set_sku
    return unless sku.blank?

    parameterized_name = name.parameterize(separator: "_")

    self.sku = parameterized_name

    retry_count = 0

    # Ensure uniqueness by appending a number/id if necessary, but shouldn't
    # be needed apart from some edge cases as name is unique.
    # If we have to retry more than 3 times, use a UUID to ensure uniqueness.
    # With UUIDs it shouldn't be needed, but have a max retry count
    # to be safe. This is to prevent infinite loops in case of a bug.
    while RequirementBlock.exists?(sku: self.sku) && retry_count < 5
      self.sku =
        "#{parameterized_name}_#{retry_count > 3 ? SecureRandom.uuid : SecureRandom.hex(3)}"

      retry_count += 1
    end
  end

  def ensure_unique_name
    return if name.blank?

    base_name = name.strip
    new_name = base_name

    # Loop to find a unique name
    while self.class.exists?(name: new_name)
      new_name = increment_last_word(new_name)
    end

    self.name = new_name
  end

  # Method to increment the last word if it's a number, or append " 2"
  def increment_last_word(input)
    words = input.split(" ")
    last_word = words.last

    if last_word.match?(/\A\d+\z/)
      # If the last word is a number, increment it
      incremented_number = last_word.to_i + 1
      words[-1] = incremented_number.to_s
    else
      # If the last word is not a number, append "2"
      words << "2"
    end

    words.join(" ")
  end
end
