class RequirementBlock < ApplicationRecord
  # searchkick must be declared before Discard::Model to ensure auto-callbacks register correctly
  searchkick searchable: %i[
               name
               requirement_labels
               associations
               configurations
             ],
             word_start: %i[name requirement_labels associations configurations]

  include HtmlSanitizeAttributes
  include Discard::Model

  sanitizable :display_description

  has_many :requirements, -> { order(position: :asc) }, dependent: :destroy
  has_many :requirement_documents,
           dependent: :destroy,
           inverse_of: :requirement_block

  has_many :template_section_blocks, dependent: :destroy
  has_many :requirement_template_sections, through: :template_section_blocks

  accepts_nested_attributes_for :requirements, allow_destroy: true
  accepts_nested_attributes_for :requirement_documents, allow_destroy: true

  enum :sign_off_role, { any: 0 }, prefix: true
  enum :reviewer_role, { any: 0 }, prefix: true
  enum :visibility, { any: 0, early_access: 1, live: 2 }, default: 0

  validates :sku, uniqueness: true, presence: true
  validates :name, presence: true
  validates :display_name, presence: true
  validate :validate_step_code_dependencies
  validate :validate_requirements_conditional
  validate :validate_requirements_data_validation
  validate :early_access_on_appropriate_template
  validate :unique_name_among_non_discarded

  before_validation :set_sku, on: :create
  before_validation :ensure_unique_name, on: :create

  after_commit :refresh_search_index,
               if: -> do
                 saved_change_to_discarded_at? || saved_change_to_visibility?
               end

  acts_as_taggable_on :associations

  after_discard { template_section_blocks.destroy_all }

  def allowed_in(requirement_template)
    if requirement_template.early_access?
      %i[any early_access].include?(visibility.to_sym)
    else
      %i[any live].include?(visibility.to_sym)
    end
  end

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
      visibility: visibility,
      created_at: created_at
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
      title: display_name,
      description: display_description,
      collapsible: true,
      collapsed: false,
      components: components_form_json(section_key)
    }
  end

  def components_form_json(section_key)
    is_optional_block = requirements.all? { |req| !req.required }
    has_documents = requirement_documents.any?
    requirement_map =
      requirements.map { |r| r.to_form_json(key(section_key)) }.compact

    requirement_map.unshift(documents_component(section_key)) if has_documents

    if is_optional_block
      requirement_map.push(optional_block_confirmation_requirement(section_key))
    end

    requirement_map
  end

  def documents_component(section_key)
    {
      id: "#{id}-documents",
      key: "#{key(section_key)}|documents",
      type: "container",
      custom_class: "requirement-document-download-button-container",
      components: [
        {
          id: "#{id}-documents-label",
          key: "#{key(section_key)}|documents-label",
          type: "content",
          html: "<h4>#{I18n.t("formio.requirement_block.documents_title")}</h4>"
        }
      ].concat(
        requirement_documents.map do |document|
          {
            id: "#{id}-document-#{document.id}",
            key: "#{key(section_key)}|document-#{document.id}",
            type: "button",
            action: "custom",
            custom_class: "requirement-document-download-button",
            label: document.file.metadata["filename"],
            custom:
              "document.dispatchEvent(new CustomEvent('downloadRequirementDocument', {
            detail: {
              id: '#{document.id}',
              filename: '#{escape_for_js(document.file.metadata["filename"])}'
            }
          }));"
          }
        end
      )
    }
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

  # Escape for single-quoted JS strings
  def escape_for_js(str)
    str.to_s.gsub(/['\\]/) { |match| "\\#{match}" }
  end

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

  def validate_requirements_data_validation
    requirements.each do |requirement|
      data_validation = requirement.input_options["data_validation"]
      next unless data_validation.present?

      unless requirement.input_type_number? || requirement.input_type_date? ||
               requirement.input_type_multi_option_select? ||
               requirement.input_type_file?
        errors.add(
          :input_options,
          "data_validation is only allowed for number, date, multi-select and file inputs"
        )
        next
      end

      if data_validation["operation"].blank? || data_validation["value"].blank?
        errors.add(
          :input_options,
          "data_validation must have operation and value"
        )
      end

      if requirement.input_type_number? &&
           !%w[min max].include?(data_validation["operation"])
        errors.add(
          :input_options,
          "data_validation operation must be min or max for number inputs"
        )
      end

      if requirement.input_type_date? &&
           !%w[before after].include?(data_validation["operation"])
        errors.add(
          :input_options,
          "data_validation operation must be before or after for date inputs"
        )
      end

      if requirement.input_type_multi_option_select? &&
           !%w[min_selected_count max_selected_count].include?(
             data_validation["operation"]
           )
        errors.add(
          :input_options,
          "data_validation operation must be min_selected_count or max_selected_count for multi-select inputs"
        )
      end

      if requirement.input_type_file? &&
           !%w[allowed_file_types].include?(data_validation["operation"])
        errors.add(
          :input_options,
          "data_validation operation must be allowed_file_types for file inputs"
        )
      end
    end
  end

  def validate_step_code_dependencies
    has_energy_step_code =
      requirements.any? { |req| req.input_type_energy_step_code? }

    return unless has_energy_step_code

    # Determine if this is a Part 3 or Part 9 block
    is_part_3 =
      requirements.any? do |req|
        req.requirement_code == "energy_step_code_tool_part_3"
      end
    is_part_9 =
      requirements.any? do |req|
        req.requirement_code == "energy_step_code_tool_part_9"
      end

    # Select the appropriate dependency schema based on the block type
    required_dependencies =
      if is_part_3
        Requirement::ENERGY_STEP_CODE_PART_3_DEPENDENCY_REQUIRED_SCHEMA.keys.map(
          &:to_s
        )
      elsif is_part_9
        Requirement::ENERGY_STEP_CODE_PART_9_DEPENDENCY_REQUIRED_SCHEMA.keys.map(
          &:to_s
        )
      else
        [] # If neither Part 3 nor Part 9 is found, no dependencies to check
      end

    has_all_dependencies =
      required_dependencies.all? do |dependency_code|
        count =
          requirements.count { |req| req.requirement_code == dependency_code }
        count == 1
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
    while self
            .class
            .where(discarded_at: nil)
            .where(first_nations: first_nations)
            .exists?(name: new_name)
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

  def unique_name_among_non_discarded
    return if name.blank?
    if self
         .class
         .where.not(id: id)
         .where(first_nations: first_nations)
         .where(discarded_at: nil)
         .exists?(name: name)
      errors.add(:name, "has already been taken")
    end
  end
end
