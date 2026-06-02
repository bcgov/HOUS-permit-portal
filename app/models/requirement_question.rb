class RequirementQuestion < ApplicationRecord
  include HtmlSanitizeAttributes
  include Discard::Model

  sanitizable :hint, :instructions

  has_many :requirements, dependent: :restrict_with_error
  has_many :requirement_blocks, through: :requirements

  enum :input_type,
       {
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
         pid_info: 19,
         energy_step_code_part_3: 20,
         multiply_sum_grid: 21,
         architectural_drawing: 22
       },
       prefix: true

  before_validation :set_requirement_code
  before_validation :merge_computed_compliance_default_settings
  before_validation :convert_value_options,
                    if:
                      Proc.new { |question|
                        Requirement::TYPES_WITH_VALUE_OPTIONS.include?(
                          question.input_type.to_s
                        )
                      }

  validates :label, presence: true
  validates :input_type, presence: true
  validates :requirement_code, presence: true
  validate :validate_value_options,
           if:
             Proc.new { |question|
               Requirement::TYPES_WITH_VALUE_OPTIONS.include?(
                 question.input_type.to_s
               )
             }
  validate :validate_unit_for_number_inputs
  validate :validate_can_add_multiple_contacts
  validate :validate_computed_compliance

  def value_options
    return nil if input_options.blank? || input_options["value_options"].blank?

    input_options["value_options"]
  end

  def number_unit
    return nil if input_options.blank? || input_options["number_unit"].blank?

    input_options["number_unit"]
  end

  def computed_compliance
    if input_options.blank? || input_options["computed_compliance"].blank?
      return nil
    end

    input_options["computed_compliance"]
  end

  def computed_compliance?
    input_options["computed_compliance"].present?
  end

  def usage_count
    requirements.count
  end

  private

  def set_requirement_code
    return if requirement_code.present?
    return if label.blank?

    self.requirement_code = label.parameterize(separator: "_")
  end

  def merge_computed_compliance_default_settings
    configuration_service = AutomatedComplianceConfigurationService.new(self)
    configuration_service.merge_default_settings!
  end

  def validate_value_options
    if input_options.blank? || input_options["value_options"].blank? ||
         !input_options["value_options"].is_a?(Array) ||
         !input_options["value_options"].all? { |option|
           option.is_a?(Hash) &&
             (option.key?("label") && option["label"].is_a?(String)) &&
             (option.key?("value") && option["value"].is_a?(String))
         }
      errors.add(:input_options, "must have value options defined")
    end
  end

  def validate_unit_for_number_inputs
    unless input_options.present? && input_options["number_unit"].present?
      return
    end

    return if input_type_number?

    errors.add(:input_options, "number_unit is only allowed for number inputs")
  end

  def validate_can_add_multiple_contacts
    unless input_options.present? &&
             input_options["can_add_multiple_contacts"].present?
      return
    end

    return if Requirement::CONTACT_TYPES.include?(input_type.to_s)

    errors.add(
      :input_options,
      "can_add_multiple_contacts is only allowed for contact inputs"
    )
  end

  def validate_computed_compliance
    configuration_service = AutomatedComplianceConfigurationService.new(self)
    config_validation = configuration_service.validate_configuration

    error = config_validation[:error]
    errors.add(:input_options, error) if error.present?
  end

  def convert_value_options
    return unless attribute_changed?(:input_options)

    input_options["value_options"] = input_options[
      "value_options"
    ].map do |option_json|
      unless option_json.is_a?(Hash) && option_json["value"].is_a?(String)
        next option_json
      end

      value = option_json["value"]
      words = value.split(" ").map(&:capitalize)
      option_json.merge("value" => words.join("").strip.camelize(:lower))
    end
  end
end
