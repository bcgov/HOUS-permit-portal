class Requirement < ApplicationRecord
  include HtmlSanitizeAttributes
  sanitizable :hint

  scope :electives, -> { where(elective: true) }

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
  validate :validate_conditional
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

  def count_of_jurisdictions_using
    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_id -> 'enabled_elective_field_ids' @> :id",
        requirement_id: id.to_s,
        id: "[\"#{id}\"]",
      )
      .count
  end

  def count_by_reason(reason)
    return 0 unless JurisdictionTemplateVersionCustomization::ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.include?(reason)

    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .select do |jtvc|
        jtvc
          .customizations
          .dig("requirement_block_changes", id.to_s, "enabled_elective_field_reasons")
          &.values
          &.include?(reason)
      end
      .count
  end

  def self.extract_requirement_id_from_submission_key(key)
    key.split("|").second
  end

  def aggregate_values_from_submissions
    # Initialize a hash to store all values for this requirement across PermitApplications from the past year
    values = []

    # Fetch only PermitApplications created within the last year
    PermitApplication
      .where("created_at >= ?", 1.year.ago)
      .find_each do |permit_application|
        # Iterate over each section to dive deeper into submission keys
        permit_application.submission_data["data"].each do |section, data|
          # Extract all keys from this section's data that contain this requirement's ID
          matching_keys =
            data.keys.select do |key|
              requirement_id_from_key = self.class.extract_requirement_id_from_submission_key(key)
              requirement_id_from_key == self.id.to_s
            end

          # Collect values for the matching keys
          matching_keys.each do |key|
            value = data[key]
            values << value unless value.nil?
          end
        end
      end

    # Determine the result based on the type of the values collected
    return nil if values.empty?

    # Check the data types of the values collected
    if values.all? { |v| v.is_a?(String) }
      # Return the most common string
      values.group_by(&:itself).max_by { |_k, v| v.size }.first
    elsif values.all? { |v| v.is_a?(Numeric) }
      # Calculate the average of numbers
      values.sum(0.0) / values.size
    else
      # Return nil for mixed or unprocessable types
      nil
    end
  end

  private

  def using_dummied_requirement_code
    uuid_regex = /^dummy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
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
          label.present? ? label.parameterize.underscore.camelize(:lower) : SecureRandom.uuid
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

  def validate_conditional
    return unless self.input_options["conditional"].present?

    conditional = self.input_options["conditional"]
    if [conditional["when"], conditional["eq"], conditional["show"]].any?(&:blank?)
      errors.add(:input_options, "conditional must have when, eq, and show")
    end
    if requirement_block.requirements.find_by_requirement_code(conditional["when"]).blank?
      errors.add(:input_options, "conditional 'when' field must be a requirement code in the same requirement block")
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
end
