class Requirement < ApplicationRecord
  include HtmlSanitizeAttributes
  sanitizable :hint

  belongs_to :requirement_block, touch: true

  acts_as_list scope: :requirement_block, top_of_list: 0

  enum input_type: {
         text: 0,
         number: 1,
         checkbox: 2,
         select: 3,
         multi_option_select: 4,
         date: 5,
         textarea: 6,
         file: 7,
         phone: 10,
         email: 11,
         radio: 12,
         address: 13,
         bcaddress: 14,
         signature: 15,
         energy_step_code: 16,
         general_contact: 17,
         professional_contact: 18,
       },
       _prefix: true

  # This needs to run before validation because we have validations related to the requirement_code
  before_validation :set_requirement_code
  before_save :convert_value_options, if: Proc.new { |req| TYPES_WITH_VALUE_OPTIONS.include?(req.input_type.to_s) }
  validate :validate_value_options, if: Proc.new { |req| TYPES_WITH_VALUE_OPTIONS.include?(req.input_type.to_s) }
  validate :validate_unit_for_number_inputs
  validate :validate_can_add_multiple_contacts
  validates_format_of :requirement_code, without: /\||\.|\=|\>/, message: "must not contain | or . or = or >"
  validates_format_of :requirement_code,
                      with: /_file\z/,
                      if: Proc.new { |req| req.input_type == "file" },
                      message: "must contain _file for file type"

  validates :label, presence: true
  validates :label,
            uniqueness: {
              scope: :requirement_block_id,
              message: "should be unique within the same requirement block",
            }
  validate :validate_energy_step_code_requirement_code
  validate :validate_energy_step_code_related_requirements_schema

  NUMBER_UNITS = %w[no_unit mm cm m in ft mi sqm sqft cad]
  TYPES_WITH_VALUE_OPTIONS = %w[multi_option_select select radio]
  CONTACT_TYPES = %w[general_contact professional_contact]

  ENERGY_STEP_CODE_REQUIREMENT_CODE = "energy_step_code_tool_part_9".freeze

  ENERGY_STEP_CODE_DEPENDENCY_REQUIRED_SCHEMA = {
    energy_step_code_method: {
      "requirement_code" => "energy_step_code_method",
      "input_type" => "select",
      "input_options" => {
        "value_options" => [
          { "label" => "Utilizing the digital step code tool", "value" => "tool" },
          { "label" => "By file upload", "value" => "file" },
        ],
      },
    },
    energy_step_code_tool_part_9: {
      "requirement_code" => "energy_step_code_tool_part_9",
      "input_type" => "energy_step_code",
      "input_options" => {
        "conditional" => {
          "eq" => "tool",
          "show" => true,
          "when" => "energy_step_code_method",
        },
        "energy_step_code" => "part_9",
      },
    },
    energy_step_code_report_file: {
      "requirement_code" => "energy_step_code_report_file",
      "input_type" => "file",
      "input_options" => {
        "conditional" => {
          "eq" => "file",
          "show" => true,
          "when" => "energy_step_code_method",
        },
      },
    },
    energy_step_code_h2000_file: {
      "requirement_code" => "energy_step_code_h2000_file",
      "input_type" => "file",
      "input_options" => {
        "conditional" => {
          "eq" => "file",
          "show" => true,
          "when" => "energy_step_code_method",
        },
      },
    },
  }
  ENERGY_STEP_CODE_REQUIRED_DEPENDENCY_CODES = ENERGY_STEP_CODE_DEPENDENCY_REQUIRED_SCHEMA.keys.map(&:to_s).freeze

  def value_options
    return nil if input_options.blank? || input_options["value_options"].blank?

    input_options["value_options"]
  end

  def number_unit
    return nil if input_options.blank? || input_options["number_unit"].blank?

    input_options["number_unit"]
  end

  def key(requirement_block_key)
    "#{requirement_block_key}|#{requirement_code}"
  end

  def to_form_json(requirement_block_key = requirement_block&.key)
    form_json_service = RequirementFormJsonService.new(self)

    form_json_service.to_form_json(requirement_block_key)
  end

  def computed_compliance?
    input_options["computed_compliance"].present?
  end

  def has_conditional?
    input_options["conditional"].present?
  end

  def has_data_validation?
    # TODO: false for now, but will be implemented in the future when
    # custom data validation is added
    false
  end

  private

  def using_dummied_requirement_code
    uuid_regex = /^dummy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    uuid_regex.match?(self.requirement_code)
  end

  def using_dummied_energy_requirement_code
    uuid_regex = /^energy-dummy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    uuid_regex.match?(self.requirement_code)
  end

  # requirement codes should not be auto generated during seeding.  Use uuid if not provided
  def set_requirement_code
    using_dummy = self.using_dummied_requirement_code
    blank = self.requirement_code.blank?
    needs_file_suffix = input_type == "file" && !requirement_code&.end_with?("_file")
    return unless using_dummy || blank || needs_file_suffix

    new_requirement_code =
      (
        if (using_dummy || blank)
          return ENERGY_STEP_CODE_REQUIREMENT_CODE if input_type_energy_step_code?

          label.blank? ? ENERGY_STEP_CODE_REQUIREMENT_CODE : label.parameterize(separator: "_")
        else
          requirement_code
        end
      )

    new_requirement_code = new_requirement_code + (needs_file_suffix ? "_file" : "")

    if using_dummy
      self.requirement_block.requirements.each do |req|
        if req.input_options.dig("conditional", "when") == self.requirement_code
          req.input_options["conditional"]["when"] = new_requirement_code
        end
      end
    end

    self.requirement_code = new_requirement_code
  end

  def formio_type_options
    form_json_service = RequirementFormJsonService.new(self)
    form_json_service.formio_type_options
  end

  def validate_value_options
    if input_options.blank? || input_options["value_options"].blank? || !input_options["value_options"].is_a?(Array) ||
         !input_options["value_options"].all? { |option|
           option.is_a?(Hash) && (option.key?("label") && option["label"].is_a?(String)) &&
             (option.key?("value") && option["value"].is_a?(String))
         }
      errors.add(:input_options, "must have value options defined")
    end
  end

  def validate_unit_for_number_inputs
    return unless (input_options.present? && input_options["number_unit"].present?)

    return(errors.add(:input_options, "number_unit is only allowed for number inputs")) if !input_type_number?

    if !NUMBER_UNITS.include?(input_options["number_unit"])
      errors.add(:input_options, "the number_unit must be one of #{NUMBER_UNITS.join(", ")}")
    end
  end

  def convert_value_options
    return unless attribute_changed?(:input_options)
    # all values MUST be converted to camelCase and stripped of white space to be compatible with rehyration on front
    # end
    input_options["value_options"] = input_options["value_options"].map do |option_json|
      # camelize the value
      # this is a two step process as camelize only camelizes individual words and ignores spaces

      # remove spaces to make one word and capitalize each word
      value = option_json["value"]
      words = value.split(" ").map(&:capitalize)

      # join the words together and then run camelize
      formatted_value = words.join("").strip.camelize(:lower)
      option_json.merge("value" => formatted_value)
    end
  end

  def validate_can_add_multiple_contacts
    return unless (input_options.present? && input_options["can_add_multiple_contacts"].present?)

    unless CONTACT_TYPES.include?(input_type.to_s)
      return(errors.add(:input_options, "can_add_multiple_contacts is only allowed for contact inputs"))
    end

    if !(
         input_options["can_add_multiple_contacts"].is_a?(TrueClass) ||
           input_options["can_add_multiple_contacts"].is_a?(FalseClass)
       )
      errors.add(:input_options, "can_add_multiple_contacts must be a boolean")
    end
  end

  def validate_energy_step_code_requirement_code
    unless input_type_energy_step_code? && requirement_code != ENERGY_STEP_CODE_REQUIREMENT_CODE &&
             !using_dummied_requirement_code
      return
    end

    errors.add(
      :requirement_code,
      :incorrect_energy_requirement_code,
      correct_requirement_code: ENERGY_STEP_CODE_REQUIREMENT_CODE,
      incorrect_requirement_code: requirement_code,
    )
  end

  def validate_energy_step_code_related_requirements_schema
    return unless ENERGY_STEP_CODE_REQUIRED_DEPENDENCY_CODES.include?(requirement_code)

    current_attributes_of_interest = self.attributes.slice("requirement_code", "input_type", "input_options").deep_dup

    # The front-end sends the conditional as an empty object due to the form setup when conditionals are not added.
    # Since the energy_step_code_method does not have any conditionals, the schema wouldn't match.
    # The easiest way to handle this is to remove the conditional key for energy_step_code_method
    # if it is an empty hash as we don't care about it. if it as it will have no effect to conditionals.
    # Note we don't want to remove the key if it has other conditionals, as we want the validation below
    # to catch that, as it is an invalid schema. Also the key is only removed from the duplicated attributes.
    if requirement_code == ENERGY_STEP_CODE_DEPENDENCY_REQUIRED_SCHEMA[:energy_step_code_method]["requirement_code"] &&
         (
           current_attributes_of_interest.dig("input_options", "conditional").present? &&
             current_attributes_of_interest.dig("input_options", "conditional").empty?
         )
      current_attributes_of_interest["input_options"].delete("conditional")
    end

    unless ENERGY_STEP_CODE_DEPENDENCY_REQUIRED_SCHEMA[requirement_code.to_sym] == current_attributes_of_interest
      errors.add(:base, :incorrect_energy_requirement_schema, requirement_code: requirement_code)
    end
  end
end
