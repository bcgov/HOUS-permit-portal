class RequirementQuestion < ApplicationRecord
  # searchkick must be declared before Discard::Model to ensure auto-callbacks register correctly
  searchkick searchable: %i[
               name
               description
               label
               requirement_code
               associations
             ],
             word_start: %i[
               name
               description
               label
               requirement_code
               associations
             ]

  include HtmlSanitizeAttributes
  include Discard::Model

  sanitizable :hint, :instructions, :description

  has_many :requirements, dependent: :restrict_with_error
  has_many :requirement_blocks, through: :requirements

  scope :shared, -> { where(shared: true) }

  acts_as_taggable_on :associations

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

  before_validation :ensure_id, if: :shared?
  before_validation :set_requirement_code
  before_validation :merge_computed_compliance_default_settings
  before_validation :convert_value_options,
                    if:
                      Proc.new { |question|
                        Requirement::TYPES_WITH_VALUE_OPTIONS.include?(
                          question.input_type.to_s
                        )
                      }

  after_commit :refresh_search_index, if: :saved_change_to_discarded_at?

  validates :label, presence: true
  validates :input_type, presence: true
  validates :requirement_code, presence: true
  validates :name, presence: true, if: :shared?
  validates :description, length: { maximum: 250 }, allow_blank: true
  validate :shared_questions_cannot_have_conditional, if: :shared?
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

  def has_data_validation?
    input_options.present? && input_options["data_validation"].present?
  end

  def usage_count
    requirements.count
  end

  def search_data
    {
      name: name,
      description: description,
      label: label,
      requirement_code: requirement_code,
      associations: association_list,
      shared: shared,
      discarded: discarded_at.present?,
      updated_at: updated_at,
      created_at: created_at
    }
  end

  private

  def ensure_id
    self.id ||= SecureRandom.uuid
  end

  def set_requirement_code
    return if requirement_code.present?
    return if label.blank?

    parameterized = label.parameterize(separator: "_")
    parameterized = "#{parameterized}_file" if input_type_file? &&
      !parameterized.end_with?("_file")

    self.requirement_code =
      if shared?
        return if id.blank?

        "#{id}:#{parameterized}"
      else
        parameterized
      end
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
    # Private questions are mirrors of a Requirement placement: the parent
    # already ran the full convert (including options_map rewrite). Re-running
    # here desyncs HistoricSite maps. Shared bank rows convert themselves.
    return unless shared?

    inverted_computed_compliance_options_map =
      computed_compliance[
        "options_map"
      ].invert if computed_compliance.present? &&
      computed_compliance["options_map"].present? &&
      computed_compliance["options_map"].is_a?(Hash)

    input_options["value_options"] = input_options[
      "value_options"
    ].map do |option_json|
      unless option_json.is_a?(Hash) && option_json["value"].is_a?(String)
        next option_json
      end

      value = option_json["value"]
      words = value.split(" ").map(&:capitalize)
      formatted_value = words.join("").strip.camelize(:lower)

      if inverted_computed_compliance_options_map.present? &&
           inverted_computed_compliance_options_map[value].present?
        self.computed_compliance["options_map"][
          inverted_computed_compliance_options_map[value]
        ] = formatted_value
      end

      option_json.merge("value" => formatted_value)
    end
  end

  def refresh_search_index
    reindex(mode: :inline)
    RequirementQuestion.search_index.refresh
  end

  def shared_questions_cannot_have_conditional
    return if input_options.blank?
    return if input_options["conditional"].blank?

    errors.add(:input_options, "conditional is not allowed on shared questions")
  end
end
