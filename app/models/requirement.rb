class Requirement < ApplicationRecord
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

  before_create :set_requirement_code
  before_save :convert_value_options, if: Proc.new { |req| TYPES_WITH_VALUE_OPTIONS.include?(req.input_type.to_s) }
  validate :validate_value_options, if: Proc.new { |req| TYPES_WITH_VALUE_OPTIONS.include?(req.input_type.to_s) }
  validate :validate_unit_for_number_inputs
  validate :validate_can_add_multiple_contacts
  validates_format_of :requirement_code, without: /\||\.|\=|\>/, message: "must not contain | or . or = or >"
  validates_format_of :requirement_code, with: /\_file/, if: Proc.new { |req| req.input_type == "file" }

  NUMBER_UNITS = %w[no_unit mm cm m in ft mi sqm sqft cad]
  TYPES_WITH_VALUE_OPTIONS = %w[multi_option_select select radio]
  CONTACT_TYPES = %w[general_contact professional_contact]

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

  def lookup_props(requirement_block_key = requirement_block&.key)
    { key(requirement_block_key) => self }
  end

  def computed_compliance?
    input_options["computed_compliance"].present?
  end

  private

  # requirement codes should not be auto generated during seeding.  Use uuid if not provided
  def set_requirement_code
    self.requirement_code ||=
      (
        if label.present?
          label.parameterize.underscore.camelize(:lower)
        else
          SecureRandom.uuid
        end
      )
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
    # all values MUST be converted to camelCase to be compatible with rehyration on front end
    input_options["value_options"] = input_options["value_options"].map do |option_json|
      option_json.merge("value" => option_json["value"].camelize(:lower))
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
end
