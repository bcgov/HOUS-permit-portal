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

  validates :sku, uniqueness: true, presence: true
  validates :name, presence: true, uniqueness: { scope: :first_nations }
  validates :display_name, presence: true
  validate :validate_step_code_dependencies
  validate :validate_requirements_conditional

  before_validation :set_sku, on: :create

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at

  acts_as_taggable_on :associations

  after_discard { template_section_blocks.destroy_all }

  def search_data
    {
      updated_at: updated_at,
      name: name,
      first_nations: first_nations,
      requirement_labels: requirements.pluck(:label),
      associations: association_list,
      configurations: configurations_search_list,
      discarded: discarded_at.present?
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

  def refresh_search_index
    RequirementBlock.search_index.refresh
  end

  def validate_requirements_conditional
    requirements.each do |requirement|
      conditional = requirement.input_options["conditional"]

      next unless conditional.present?

      if [conditional["when"], conditional["eq"]].any?(&:blank?) ||
           [conditional["show"], conditional["hide"]].all?(&:blank?)
        errors.add(
          :input_options,
          "conditional must have when and eq, and one of show or hide"
        )
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
end
